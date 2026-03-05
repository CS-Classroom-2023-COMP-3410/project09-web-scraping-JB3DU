//Read from https://bulletin.du.edu/undergraduate/coursedescriptions/comp/
const cheerio = require('cheerio');
const axios = require('axios');
axios.get('https://bulletin.du.edu/undergraduate/coursedescriptions/comp/')
.then(response => {
    const $ = cheerio.load(response.data);
    //First, get all <div> elements with the class "courseblock"
    const courseBlocks = $("div.courseblock");
    //For each course block, get the <strong> element and the <p> element underneath it.
    let strongElements = [];
    let pElements = [];
    courseBlocks.each((index, element) => {
        const strongText = $(element).find("strong").text();
        const pText = $(element).find("p").text();
        //Debug info
        //console.log(strongText);
        //console.log(pText);
        //Make two arrays, one for the strong elements, one for the p elements
        
        strongElements.push(strongText);
        pElements.push(pText);
    });
    let filteredStrong = [];
    let filteredP = [];
    //Iterates through each <strong> element. Checks if the sixth character is 3. If it is, checks the <p> element. Otherwise, it is excluded.
    for(let i = 0; i < strongElements.length; i++) {
        //console.log(strongElements[i]);
        //console.log(pElements[i]);
        let strongText = strongElements[i];
        if (strongText.length >= 6 && strongText[5] === "3") {
            let pText = pElements[i];
            //Strong elements are excluded if their respective <p> element contains the phrase "Prerequisite". Blank results are included.
            if (!pText.includes("Prerequisite")) {
                filteredStrong.push(strongText);
                filteredP.push(pText);
            }
        }
    }
    //The remaining strong elements will be split.The first 10 characters are designated as the "course", and the characters between index 10 and the opening parentheses are designated as "title".
    let allCourses = [];
    for(let i = 0; i < filteredStrong.length; i++) {
        const text = filteredStrong[i];
        const course = text.substring(0, 10).trim();
        const title = text.substring(10, text.indexOf("(")).trim(); //Everything after the parentheses designates the total credits, which isn't very relevant here.
        //The course and title are put into an array 
        allCourses.push({ course, title });
    }
    //console.log(allCourses);
    //Finally, the allCourses array is written to a JSON file.
    const fs = require('fs');
    fs.writeFileSync('bulletin.json', JSON.stringify(allCourses, null, 2));
    console.log('Data written to bulletin.json!');
})


//axios.get('https://denverpioneers.com/index.aspx');


//axios.get('https://www.du.edu/calendar/').then(response => {;

.catch(error=>{
    console.error(error);
})