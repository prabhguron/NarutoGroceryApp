import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js"
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"

// Initialize Firebase app
const appSettings = {
  apiKey: "AIzaSyBtcPPVvIyI6iaSlpriHIBD7h2dhc_IQYM",
  authDomain: "grocery-helper-653fd.firebaseapp.com",
  databaseURL: "https://grocery-helper-653fd-default-rtdb.firebaseio.com",
  projectId: "grocery-helper-653fd",
  storageBucket: "grocery-helper-653fd.appspot.com",
  messagingSenderId: "487658271712",
  appId: "1:487658271712:web:3df26249ca7f1200d37185"
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
let colors = [];
// Get a reference to the current user's shopping list
let userId;
const auth = getAuth();
signInAnonymously(auth)
  .then((userCredential) => {
    userId = userCredential.user.uid;
    const shoppingListInDB = ref(database, `users/${userId}/shoppingList`);

    // Rest of your code (event listeners, etc.) goes here
    const inputFieldEl = document.getElementById("input-field");
    const inputFieldColor = document.getElementById("input-color");
    const addButtonEl = document.getElementById("add-button");
    const sortButtonEl = document.getElementById("sort-button");
    const shoppingListEl = document.getElementById("shopping-list");
 
    addButtonEl.addEventListener("click", function() {
        let inputValue = inputFieldEl.value;
        let inputColor = inputFieldColor.value;
        

        push(shoppingListInDB, {value:inputValue, color: inputColor} );

        clearInputFieldEl();
      
    });
    sortButtonEl.addEventListener("click",function(){
      console.log(colors)

    })


  
  onValue(shoppingListInDB, function(snapshot) {
        if (snapshot.exists()) {
            let itemsArray = Object.entries(snapshot.val());
            clearShoppingListEl();
            

            for (let i = 0; i < itemsArray.length; i++) {
                let currentItem = itemsArray[i];
                let currentItemID = currentItem[0];
                let currentItemValue = currentItem[1];
                let currentItemValueColor = currentItem[1];
             
              colors.push({color : currentItemValue.color, value: currentItemValue.value})
  appendItemToShoppingListEl(currentItemID, currentItemValue.value,currentItemValue.color);
            }
        } else {
            shoppingListEl.innerHTML = "No items here... yet";
        }
    });

    function clearShoppingListEl() {
        shoppingListEl.innerHTML = "";
    }

    function clearInputFieldEl() {
        inputFieldEl.value = "";
        inputFieldColor.value="";
    }

    function appendItemToShoppingListEl(itemID, itemValue,itemColor) {
        let newEl = document.createElement("li");
        newEl.textContent = itemValue;
        newEl.style.backgroundColor = itemColor
        

        newEl.addEventListener("click", function() {
            let exactLocationOfItemInDB = ref(database, `users/${userId}/shoppingList/${itemID}`);
          
          remove(exactLocationOfItemInDB)

        });
           

        shoppingListEl.append(newEl);
    }
  })
  .catch((error) => {
    console.error("Error signing in anonymously:", error);
  });

  