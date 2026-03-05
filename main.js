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
    


axios.get('https://denverpioneers.com/index.aspx')
.then(response => {
    //The html has 15000 LINES.... You cannot be serious..........
    //Anyways,
    //Cycle through all the <script> tags, check for ones with "var obj" in the next line:
    const $ = cheerio.load(response.data);
    const scriptTags = $("script");
    let calenderData = [];
    scriptTags.each((index, element) => {
        const scriptContent = $(element).html();
        if (scriptContent && scriptContent.includes("var obj")) {
            if(scriptContent.includes("Michigan") && scriptContent.includes("M Lacrosse")) {
                calenderData = scriptContent;
            }
        }
    });
    //sconsole.log(calenderData);
    //Turn obj into an array of objects, each object representing a game. Skip index 0 as it is a dummy object:
    const objLen = calenderData.length;
    //Get index of first instance in objLen:
    const firstIndex = calenderData.indexOf("{");
    const lastIndex = calenderData.lastIndexOf("}");
    const objString = calenderData.substring(firstIndex, lastIndex+1);
    //console.log(objString);
    //Turn objString into an array, with each object representing a game. Skip index 0 as it is a dummy object:
    const objArray = objString.split("},").map(obj => obj + "}").slice(1);
    let elements = []
    for(let i = 1; i < objArray.length; i++) {
        if(objArray[i].includes('opponent":') && objArray[i].includes('title":')) {
            //console.log("------");
            const indexOppStart = objArray[i].indexOf('"name":');
            const indexOppEnd = objArray[i].indexOf(',"title"');
            //console.log(objArray[i].substring(indexOppStart+7, indexOppEnd));
            //console.log("------");
            elements.push(objArray[i].substring(indexOppStart+8, indexOppEnd-1)); //Get opponent team name
        }
        if(objArray[i].includes('hometeam') && objArray[i].includes('short_title')) {
            const indexTitleStart = objArray[i].indexOf(',"title":');
            const indexTitleEnd = objArray[i].indexOf('"abbre');
            //console.log(objArray[i].substring(indexTitleStart+9, indexTitleEnd-1));
            elements.push(objArray[i].substring(indexTitleStart+10, indexTitleEnd-2)); //Get the home team title
            const dateTitleStart = objArray[i].indexOf('"date":');
            //console.log(objArray[i].substring(dateTitleStart+8, dateTitleStart+18));
            elements.push(objArray[i].substring(dateTitleStart+8, dateTitleStart+18)); //Get the date of the event
            
        }
        
    }
    //console.log(elements);
    //Due to some weirdness, the first element isn't connected to any of the others. it's an old event, so whatever. Anyways, starting at index 1, I'll pair them in groups of three.
    events = [];
    for(let i = 1; i < elements.length; i+=3) {
        const opponent = elements[i];
        const title = elements[i+1];
        const date = elements[i+2];
        //console.log(`Opponent: ${opponent}, Title: ${title}, Date: ${date}`);
        events.push({opponent, title, date});
    }
    //console.log(events);
    const fs = require('fs');
    fs.writeFileSync('athletic_events.json', JSON.stringify(events, null, 2));
    console.log('Data written to athletic_events.json!');

})
//COme on commit.




axios.get('https://www.du.edu/calendar/').then(response => {
    const $ = cheerio.load(response.data);
    const calendar_events = [];
    //Get everything within the <div> with a class that contains the text "events-listing__item"
    const eventListing = $('div[class*="events-listing__item"]');
    //console.log(eventListing);
    //Get the <a> within that <div> with class="event-card"
    const eventCards = eventListing.find('a.event-card');
    //console.log("hi");
    eventCards.each((index, element) => {
        let title = $(element).find("h3").text();
        title = title.trim();
        //console.log(title);
        const remainder = $(element).find("p").text();
        const date = remainder.substring(0, 8).trim();
        const remainderafter = remainder.substring(8).trim();
        const timeEnd = remainderafter.indexOf("m");
        const time = remainderafter.substring(0, timeEnd+1);
        //console.log(remainderafter);
        //console.log(`Title: ${title}, Date: ${date}`);
        calendar_events.push({ title, date, time });
    });
    //console.log("bye");
    //Write to a JSON file
    //console.log(calendar_events);
    const fs = require('fs');
    fs.writeFileSync('du_events.json', JSON.stringify(calendar_events, null, 2));
    console.log('Data written to du_events.json!');

    //NOTE: The html did NOT contain any descriptions, so that field is absent.

})

.catch(error=>{
    console.error(error);
})