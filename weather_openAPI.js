const request = require("request");
const fs = require("fs");

var url =
  "http://apis.data.go.kr/1360000/AsosHourlyInfoService/getWthrDataList";
var queryParams =
  "?" +
  encodeURIComponent("serviceKey") +
  "=W%2B5swTrRFZkh5iro7bK2%2F%2FkLeDmGw%2BRhqwQ3gGR73X0eBkL8yCH7Yz7Tf8RryPu6cQ2ngY0CQgbXurNryJtUVA%3D%3D"; /* Service Key*/
//queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* */
queryParams +=
  "&" + encodeURIComponent("numOfRows") + "=" + encodeURIComponent("999"); /* */
queryParams +=
  "&" + encodeURIComponent("dataType") + "=" + encodeURIComponent("JSON"); /* */
queryParams +=
  "&" + encodeURIComponent("dataCd") + "=" + encodeURIComponent("ASOS"); /* */
queryParams +=
  "&" + encodeURIComponent("dateCd") + "=" + encodeURIComponent("HR"); /* */
queryParams +=
  "&" +
  encodeURIComponent("startDt") +
  "=" +
  encodeURIComponent("20230313"); /* */
queryParams +=
  "&" + encodeURIComponent("startHh") + "=" + encodeURIComponent("08"); /* */
queryParams +=
  "&" +
  encodeURIComponent("endDt") +
  "=" +
  encodeURIComponent("20230323"); /* */
queryParams +=
  "&" + encodeURIComponent("endHh") + "=" + encodeURIComponent("20"); /* */
queryParams +=
  "&" + encodeURIComponent("stnIds") + "=" + encodeURIComponent("119"); /* */

request(
  {
    url: url + queryParams,
    method: "GET",
  },
  function (error, response, body) {
    console.log("Status : ", response.statusCode, "\n");
    console.log("Headers : ", JSON.stringify(response.headers, "\n"));
    console.log("Reponse received", body);
    // body = JSON.stringify(body)
    fs.writeFileSync("./weather.json", body);
  }
);
