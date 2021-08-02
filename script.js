//Getting the elements in html file by id 
const mealsE1 = document.getElementById('meals');
const favoriteContainer = document.getElementById('fav-meals');
const searchTerm = document.getElementById('search-term');
const searchBtn = document.getElementById('search');
const mealPopup = document.getElementById('meal-popup');
const popupCloseBtn = document.getElementById('close-popup');
const mealInfoE1 = document.getElementById('meal-info')

//Calling the functions
getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    //Fetching the website. It return promise so async is used in function and await here 
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');

    //coverting it into json and calling 0th element of the array as it have so many elements of paarticular meal
    const respData = await resp.json();
    const randomMeal = respData.meals[0];

    console.log(randomMeal);

    //calling this function
    addMeal(randomMeal, true);
};

async function getMealById(id) {
    //Fetching the website by id. It return promise so async is used in function and await here 
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);

    //coverting it into json and calling 0th element of the array as it have so many elements of paarticular meal
    const respData = await resp.json();
    const meal = respData.meals[0]
};

async function getMealsBySearch(term) {
    //Fetching the website by term. It return promise so async is used in function and await here 
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?s=' + term)

    //coverting it into json and calling all element of the array as it have so many elements of particular meal and user have searched 
    //so we have to display all the elements
    const respData = await resp.json();
    const meals = respData.meals;

    //returning the element searched
    return meals;
};

function addMeal(mealData, random = false) {
    //creating div and adding class in it
    const meal = document.createElement('div');
    meal.classList.add('meal');

    //writing in the class meal
    meal.innerHTML = `
        ${random ? ` <span class="random">
        Random Recipe
    </span>` : ''}
        <img src= "${mealData.strMealThumb}" 
             alt= "${mealData.strMeal}">
    </div>
    <div class="meal-body">
        <h4>${mealData.strMeal}</h4>
        <button class="fav-btn" onclick=""><i class="fas fa-heart">like</i></button>
    </div>
</div>`;


    //Selecting the class fav-btn
    const btn = meal.querySelector('.fav-btn')

    //adding event click in it
    btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) {
            //If it already contains class active in it then on click remove class active
            removeMealFromLS(mealData.idMeal)//remove from localstorage
            btn.classList.remove('active')
        }
        else {
            //else add class active
            addMealToLS(mealData.idMeal)//add to local storage
            btn.classList.add("active")
        }

        //Clean the container
        favoriteContainer.innerHTML = '';
        fetchFavMeals();//fetching the favmeals
    });

    //adding event click i n meal
    meal.addEventListener('click' , () => {
        showMealInfo(mealData)//shows all the meal info
    })

    //appending(adding after) it in mealE1(described on the top)
    mealsE1.appendChild(meal);

}

function addMealToLS(mealId) {
    //calling function
    const mealIds = getMealsFromLS();

    //Saving item to local storage. it is saved as string so we convert it into string by stringify
    //.setItem() it takes first arguement as name of object and second as object and save it to local storage
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]))//saving data as meal ids
    //...mealIds means complete array of mealIds
}

function removeMealFromLS(mealId) {
    //calling function
    const mealIds = getMealsFromLS();

    //Removing items from local storage
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter((id) => id !== mealId)))
}

function getMealsFromLS(meal) {
    //To get items from local storage. It is stored as string so we have to parse it to read data 
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    return mealIds === null ? [] : mealIds;//If else . else after :
}

async function fetchFavMeals() {
    const mealIds = getMealsFromLS();

    //fetch all the favorite meals
    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];

        meal = await getMealById(mealId);

        addMealFav(meal);
    }
}

function addMealFav(mealData) {
    //clean the container
    //favoriteContainer.innerHTML = '';

    //crating a list
    const favMeal = document.createElement('li');

    //use try and catch as it returns promise
    try {
        //writing in the list
        favMeal.innerHTML = `
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"><span>"${mealData.strMeal}"</span>
    <button class="clear"><i class="fas fa-window-close"></i></button>
    `;
    }
    catch (e) {
        //if error occours
        console.log("error: ", e);
    }

    //selecting class clear
    const clearBtn = favMeal.querySelector(".clear")

    //adding event on click remove from fav
    clearBtn.addEventListener('click', () => {
        removeMealFromLS(mealData.idMeal);

        //calling function
        fetchFavMeals();
    });

    //adding event on click it shows meal info
    meal.addEventListener('click', () => {
        showMealInfo(mealData)
    })

    //append to favoriteContainer
    favoriteContainer.appendChild(favMeal);
};

function showMealInfo(mealData) {
    //Clean it up
    mealInfoE1.innerHTML = '';

    //update the meal info
    const mealE1 = document.createElement('div');

    //declearing it as an array
    const ingredients = [];

    //get the ingridients and measures
    for(let i=0; i<20; i++){
        if(mealData['strIngredient'+i]){
            ingredients.push(`${mealData['strIngredient'+i]} - ${mealData['strMeasure'+i]}`)
        }
        else{
            break;
        }
    }

    //Writing in mealE1
    mealE1.innerHTML = `
        <h1>${mealData.strMeal}</h1>
            <img src=${mealData.strMealThumb} alt="${mealData.strMeal}">
            <p>${mealData.strInstructions}</p>
            <h3>Ingredients : </h3>
            <ul>
                ${ingredients.map((ing) => `
                <li>${ing}</li>
                `).join("")}
            </ul>                 
    `;

    //appending it
    mealInfoE1.appendChild(mealE1);

    //Show the popup
    mealPopup.classList.remove('hidden');
}

searchBtn.addEventListener('click', async () => {
    //clean container
    meals.innerHTML = '';

    //declaring search variable (searchTerm is written at the top)
    const search = searchTerm.value;

    //calling getMealsBySearch function
    const mealsE1 = await getMealsBySearch(search);

    if (meals) {
        meals.forEach((meal) => {
            addMeal(meal);
        })
    }
});

//Adding event on click add class hidden
popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.add('hidden');


})