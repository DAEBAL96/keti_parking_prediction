const mysql = require('mysql');
const fs = require('fs');


list = ["KETI014", "KETI015", "KETI016", "KETI017", "KETI018", "KETI019",
"KETI020", "KETI021", "KETI022", "KETI023", "KETI024", "KETI025",
"KETI026", "KETI027", "KETI028", "KETI029", "KETI030", "KETI031",
"KETI032", "KETI033", "KETI034", "KETI035", "KETI036", "KETI037",
"KETI038", "KETI039", "KETI040", "KETI041", "KETI042", "KETI069",
"KETI070", "KETI071", "KETI072", "KETI073", "KETI074", "KETI075",
"KETI076", "KETI077", "KETI078", "KETI079", "KETI080", "KETI081",
"KETI082", "KETI093", "KETI094", "KETI095", "KETI096", "KETI097", 
"KETI098", "KETI099", "KETI100", "KETI101", "KETI102", "KETI103",
"KETI104", "KETI105", "KETI106", "KETI107", "KETI108", "KETI109",
"KETI110", "KETI111", "KETI112", "KETI117", "KETI118", "KETI119",
"KETI120", "KETI121", "KETI122", "KETI123", "KETI126", "KETI127",
"KETI128", "KETI129", "KETI130", "KETI131", "KETI132", "KETI133",
"KETI134", "KETI135", "KETI136", "KETI137", "KETI138", "KETI139",
"KETI151", "KETI152", "KETI153", "KETI154", "KETI155", "KETI156",
"KETI157", "KETI158", "KETI159", "KETI161", "KETI162",
"KETI163", "KETI164", "KETI165", "KETI166", "KETI167", "KETI168",
"KETI169", "KETI170", "KETI171", "KETI172", "KETI173", "KETI174", 
"KETI175", "KETI176", "KETI177", "KETI178", "KETI180",
"KETI182", "KETI184", "KETI185", "KETI186",
"KETI187", "KETI188", "KETI189", "KETI190", "KETI192", "KETI207", "KETI208",
"KETI209", "KETI210", "KETI211"];

// create a connection to the database
const connection = mysql.createConnection({
  host: '203.253.128.164',
  user: 'root',
  password: 'keti1234',
  database: 'mobiusdb'
});

// connect to the database
connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database!');
  });

// export data from the table in JSON format using a query statement
async function exportData(list) {
    for(var i = 0; i < list.length; i++){
        const query = `select c.pi, c.ri, c.con, l.ct from mobiusdb.cin as c, mobiusdb.lookup as l where c.ri = l.ri and c.pi = '/Mobius/AIparking/${list[i]}' and l.ct LIKE '202303%'`;
        try {
            const results = await new Promise((resolve, reject) => {
                connection.query(query, (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
            fs.writeFile(`./202303/${list[i]}.json`, JSON.stringify(results), (err) => {
                if (err) throw err;
                console.log(`Data exported to ${list[i]}.json file.`);
            });
        } catch (err) {
            console.error(`Error exporting data for ${list[i]}: `, err);
        }
    }

    // close the connection
    connection.end((err) => {
        if (err) throw err;
        console.log('Connection closed.');
    });
}

exportData(list);