package main

import (
    "path/filepath"
    "runtime"
    "encoding/json"
    "fmt"
    // "strconv"
    "strings"
    "log"
    "bufio"
	"io"
    "io/ioutil"
	"net/http"
	"os"

    "unicode"
	"golang.org/x/text/runes"
    "golang.org/x/text/transform"
    "golang.org/x/text/unicode/norm"
)
// `go get` the below :D
    // "golang.org/x/text/runes"
    // "golang.org/x/text/transform"
    // "golang.org/x/text/unicode/norm"
// bool
// string
// int  int8  int16  int32  int64
// uint uint8 uint16 uint32 uint64 uintptr
// byte // alias for uint8
// rune // alias for int32
//      // represents a Unicode code point
// float32 float64
// complex64 complex128
// := auto converts

const weatherAPI = "21b42c2cf372b4a861c3d8e8f2f0ef88";
const weatherAPIKey = "APPID";
const weatherEndPoint = "api.openweathermap.org/data/2.5";
const weatherEndURI = "/weather";
type WeatherJSONSchema struct {
    Coord CoordSchema
    JsonResp string
    Stamp uint32
}
type WeatherSchema struct {
    JsonResp WeatherJSONSchema
    Stamp uint32
}
type SearchSchema struct {
    Q string
}
type DataSchema struct {
    JsonResp WeatherJSONSchema
    Stamp uint32
}
type CoordSchema struct {
    Lat float64 `json:"lat"`
    Lon float64 `json:"lon"`
}
type CitySchema struct {
    Id uint32 `json:"_id"`
    Name string `json:"name"`
    Hashname string
    Country string `json:"country"`
    Coord CoordSchema `json:"coord"`
}
// var weatherResponses []WeatherJSONSchema;
var cityListTyped []CitySchema;
//{"_id":707860,"name":"Hurzuf","country":"UA","coord":{"lon":34.283333,"lat":44.549999}}
//lat={lat}&lon={lon}
//q={city name},{country code}
//zip={zip code},{country code}
func main() {
    fmt.Println("GET CITY LIST CACHE");
    cityList:=popCityList();
    cityListTyped=convertCityList(cityList);
    //fmt.Println("cityListTyped: ",cityListTyped);//[0].Coord.Lat
    // fmt.Println("cityListTyped: ",cityListTyped[0].Coord.Lat);//

    fmt.Println("GOT CACHE");
    http.HandleFunc("/", httpIndex)
    http.HandleFunc("/search", httpSearch)
    http.HandleFunc("/data", httpData)
    http.ListenAndServe(":9500", nil)
}
func sendJSONHeader(res http.ResponseWriter, req *http.Request){
    origin := req.Header.Get("Origin");
    if  origin != "" {
        res.Header().Set("Access-Control-Allow-Origin", origin)
        res.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
        // res.Header().Set("Access-Control-Allow-Headers",
        //     "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
        res.Header().Set("Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept")
    }
    // fmt.Println("origin!",origin);
    //res.Header().Set("Access-Control-Allow-Origin", "*")
    res.Header().Set("Content-Type", "application/json")
}
func httpIndex(res http.ResponseWriter, req *http.Request) {
    // fmt.Println("REQ Index!");
    sendJSONHeader(res,req);
    io.WriteString(res, "{'code':400}")
}
func httpSearch(res http.ResponseWriter, req *http.Request) {
    // fmt.Println("REQ httpSearch!");
    var dataList []CitySchema;
    var query=req.URL.Query()["q"];
    var cleanStr string;
    if query != nil && len(query) > 0 {
      cleanStr = sanitizeStr(strings.ToLower(query[0]));
    }

    err := req.ParseForm()
    if err != nil {
        fmt.Println("ERR httpSearch!",err.Error());
        if err.Error()!="EOF" {
            panic(err)
        }
    }else if len(req.PostFormValue("q"))>0{
        cleanStr = sanitizeStr(strings.ToLower(req.PostFormValue("q")));
    }
    defer req.Body.Close()


    if len(cleanStr) > 0 {
        for _,element := range cityListTyped {
            if element.Hashname == cleanStr || strings.Contains(element.Hashname,cleanStr) {
                dataList=append(dataList, element);
            }
        }
    }

    sendJSONHeader(res,req);
    if len(dataList)==0 {
        io.WriteString(res, "[]")
    }else{
        json.NewEncoder(res).Encode(dataList);
    }

    // fmt.Println("RES httpSearch!");
}
func httpData(res http.ResponseWriter, req *http.Request) {
    // fmt.Println("REQ httpData!");


    var query_lat=req.URL.Query()["lat"];
    var query_lon=req.URL.Query()["lon"];
    var clean_lat string;
    var clean_lon string;
    if query_lat != nil && len(query_lat) > 0 {
      clean_lat = query_lat[0];
    }
    if query_lon != nil && len(query_lon) > 0 {
      clean_lon = query_lat[0];
    }

    err := req.ParseForm()
    if err != nil {
        if err.Error()!="EOF" {
            panic(err)
        }
    }
    if len(req.PostFormValue("lat"))>0{
        clean_lat = req.PostFormValue("lat");
    }
    if len(req.PostFormValue("lon"))>0{
        clean_lon = req.PostFormValue("lon");
    }
    defer req.Body.Close()
    // num_lat,_:=strconv.ParseFloat(clean_lat, 64);
    // num_lon,_:=strconv.ParseFloat(clean_lon, 64);
    var output=getWeatherData(clean_lat,clean_lon);
    sendJSONHeader(res,req);
    if len(output)==0 {
        io.WriteString(res, "{\"cod\":400}")
    }else{
        io.WriteString(res, output)
    }

    // fmt.Println("RES httpData!");
}
func convertCityList(listIn []string)[]CitySchema {
    var output []CitySchema;
    for i,el := range listIn {
        var cityLine CitySchema;
        lineByte:=[]byte(el)
        cErr := json.Unmarshal(lineByte, &cityLine);

        if cErr != nil {
            log.Fatal(cErr)
            fmt.Println("ERR I: %+v",i,el);
        }else{
            cityLine.Hashname=sanitizeStr(cityLine.Name);
            output=append(output,cityLine)
        }
        //fmt.Println("I: %+v",i,"\ncityLine: ",cityLine,"\nel(str)",el);
      // index is the index where we are
      // element is the element from someSlice for where we are
    }

    return output;
}
func sanitizeStr(strIn string)string {
    var output string;
    t := transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
    s, _, _ := transform.String(t, strIn)

    output=strings.ToLower(string(s))
    return output;
}
func docRoot()string{
    // _, filename, _, ok := runtime.Caller(1)
    _, filename, _, _ := runtime.Caller(1)
    dir := filepath.Dir(filename)
    // if err != nil {
    //     fmt.Println(ok)
    //     panic(err)
    // }
    // fmt.Println("CITY LINE STRING\n",filename,dir)
    return dir+"/";
}
func popCityList()[]string {
    var cityList []string;
    file, err := os.Open(docRoot()+"city.list.json")
    if err != nil {
        log.Fatal(err)
    }
    defer file.Close()

    scanner := bufio.NewScanner(file)
    for scanner.Scan() {
        //fmt.Println("CITY LINE STRING\n",scanner.Text())
        cityList = append(cityList, scanner.Text())
    }

    if err := scanner.Err(); err != nil {
        log.Fatal(err)
    }
    return cityList;
}
func getWeatherData(lat string,lon string)string{
    // weatherResponses -> check each response for lat/lon and returned cache
    // url := fmt.Sprintf("http://%s%s?lat=%s&lon=%s&%s=%s", weatherEndPoint, weatherEndURI, lat, lon, weatherAPIKey, weatherAPI)
    url := "http://" + weatherEndPoint + weatherEndURI + "?lat="+lat+"&lon="+lat+"&"+weatherAPIKey+"="+weatherAPI;
// fmt.Println("URL ",url,"\nLAT: ",lat,"LON: ",lon);
    req, err := http.NewRequest("GET", url, nil)
// fmt.Println("req\n",req);
	if err != nil {
		log.Fatal("NewRequest: ", err)
	}
    client := &http.Client{};
    resp, err := client.Do(req)
	if err != nil {
		log.Fatal("Do: ", err)
		return "";
	}
    defer resp.Body.Close()
    htmlData, err := ioutil.ReadAll(resp.Body)
    if err != nil {
		log.Fatal("Do: ", err)
		return "";
    }
// fmt.Println("string(htmlData)",string(htmlData));

    return string(htmlData);
}
