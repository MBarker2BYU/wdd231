const courses = 
    [
        {
            name: "Programming Building Blocks",
            code: "CSE 110",
            type: "CSE",
            credits: 2,
            completed: true,
        },
        {
            name: "Programming with Functions",
            code: "CSE 111",
            type: "CSE",
            credits: 2,
            completed: true,
        },
        {
            name: "Programming with Classes",
            code: "CSE 210",
            type: "CSE",
            credits: 2,
            completed: true,
        },
        {
            name: "Web Fundamentals",
            code: "WDD 130",
            type: "WDD",
            credits: 2,
            completed: true,
        },
        {
            name: "Dynamic Web Fundamentals",
            code: "WDD 131",
            type: "WDD",
            credits: 2,
            completed: true,
        },
        {
            name: "Web Frontend Development I",
            code: "WDD 231",
            type: "WDD",
            credits: 2,
            completed: false,
        },
    ];

renderCourses(courses); // Initial render of all courses

const allFilter = document.querySelector("#all-filter");
const cseFilter = document.querySelector("#cse-filter");
const wddFilter = document.querySelector("#wdd-filter");

allFilter.addEventListener("click", () => 
    {
        renderCourses(courses);        
    });


cseFilter.addEventListener("click", () =>
    {
        const filteredCourses = courses.filter(course => course.type === "CSE");
        renderCourses(filteredCourses);        
    });

wddFilter.addEventListener("click", () =>
    {
        const filteredCourses = courses.filter(course => course.type === "WDD");
        renderCourses(filteredCourses);        
    });

function renderCourses(courses) 
{
    document.querySelector(".filtered-courses").innerHTML = ""; // Clear the list before rendering

    const courseList = document.querySelector(".filtered-courses");

    let credits = 0;
    let completedCredits = 0; // Initialize completed courses count

    courses.forEach(course => 
    {
        let courseButton = document.createElement("button");
        let innerHTML = "";
        
        if (course.completed) 
        {
            innerHTML = `<span style="color: green; background: white; border-radius: 12px; font-weight: bold;">✓</span>`; // Append "(Completed)" if the course is completed
            completedCredits += course.credits; // Add to completed credits if the course is completed
        }
        else 
        {
            innerHTML = `<span style="color: red; background: white; border-radius: 12px; font-weight: bold;">✗</span>`; // Append "(Not Completed)" if the course is not completed

            courseButton.style.backgroundColor = "#3f4443"; // Change color to green if completed            
        }         

        innerHTML += ` ${course.code} - ${course.name}`;

        courseButton.innerHTML = innerHTML;
        courseButton.classList.add("course-button");

        courseList.appendChild(courseButton);

        credits += course.credits; // Add to total credits       
         
    });

    const creditsElement = document.querySelector("#credits");
    const completedCreditsElement = document.querySelector("#completed-credits");

    creditsElement.innerHTML = `The total number of course credits listed below is ${credits}.`; // Update the total credits displayed
    completedCreditsElement.innerHTML = `The total number of completed course credits listed below is ${completedCredits}.`; // Update the total completed credits displayed

}