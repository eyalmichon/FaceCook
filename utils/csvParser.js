// const fs = require('fs');


// read a csv file and insert into mysql to schemea named 'recipesdb' and table named 'recipes' with columns:
// recipe_id, name, contributor_id, date_submitted, minutes, kcal, total_fat, protein, sodium, saturated_fat, sugar, carbohydrates, category
// const raw_data = fs.readFileSync('raw_data/data_new.csv', 'utf8');

// let datalines = raw_data.split('\n');
// let headers = datalines[0].split(',');
// headers[headers.length - 1] = headers[headers.length - 1].replace(/\r/g, '');

// let data = [];
// // for (let i = 1; i < 2; i++) {
// for (let i = 1; i < datalines.length; i++) {
//     let obj = {};
//     let currentline = '';

//     if (datalines[i].length === 0) continue;
//     // I need to check if the name has a comma in it, if so, I need to split the string into 3 parts
//     // the first part is the id, the second part is the name, and the third part is the rest of the data
//     // I need to do this because some names have commas in them and I need to keep the name as one string and not split it
//     if (datalines[i].includes('"')) {
//         let id = datalines[i].substring(0, datalines[i].indexOf(','));
//         let name = datalines[i].substring(datalines[i].indexOf('"'), datalines[i].lastIndexOf('"') + 1);
//         let temp = datalines[i].substring(datalines[i].lastIndexOf('"') + 2).split(',');
//         temp.unshift(name);
//         temp.unshift(id);
//         currentline = temp.filter(str => str.length > 0);
//     }
//     else {
//         currentline = datalines[i].split(',');
//     }

//     for (let j = 0; j < headers.length; j++) {
//         obj[headers[j]] = currentline[j];
//     }
//     // remove \r from the end of the string
//     obj['category'] = obj['category']?.replace(/\r/g, '');
//     // console.log(obj);
//     data.push(obj);
// }