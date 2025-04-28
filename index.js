import { initializeApp as initializeFirebaseApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase as getFirebaseDatabase, ref as databaseRef, push as pushToDatabase, onValue as onDatabaseValueChange, remove as removeFromDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth as getFirebaseAuth, signInAnonymously as signInAnonymouslyWithFirebase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import firebaseConfig from './config.js';

(function () {
    const relList = document.createElement("link").relList;
    if (relList && relList.supports && relList.supports("modulepreload")) return;

    for (const linkElement of document.querySelectorAll('link[rel="modulepreload"]')) handleModulePreload(linkElement);

    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === "childList") {
                for (const addedNode of mutation.addedNodes) {
                    if (addedNode.tagName === "LINK" && addedNode.rel === "modulepreload") handleModulePreload(addedNode);
                }
            }
        }
    }).observe(document, { childList: true, subtree: true });

    function getRequestOptions(linkElement) {
        const options = {};
        if (linkElement.integrity) options.integrity = linkElement.integrity;
        if (linkElement.referrerPolicy) options.referrerPolicy = linkElement.referrerPolicy;
        if (linkElement.crossOrigin === "use-credentials") options.credentials = "include";
        else if (linkElement.crossOrigin === "anonymous") options.credentials = "omit";
        else options.credentials = "same-origin";
        return options;
    }

    function handleModulePreload(linkElement) {
        if (linkElement.ep) return;
        linkElement.ep = true;
        const requestOptions = getRequestOptions(linkElement);
        fetch(linkElement.href, requestOptions);
    }
})();

console.log(firebaseConfig.apiKey); // Example usage



const firebaseApp = initializeFirebaseApp(firebaseConfig);
const database = getFirebaseDatabase(firebaseApp);

let shoppingListData = [];
let currentUserId;

const auth = getFirebaseAuth();
signInAnonymouslyWithFirebase(auth)
    .then((authResult) => {
        currentUserId = authResult.user.uid;

        const userShoppingListRef = databaseRef(database, `users/${currentUserId}/shoppingList`);
        const inputField = document.getElementById("input-field");
        const addButton = document.getElementById("add-button");
        const sortButton = document.getElementById("sort-button");
        const shoppingListContainer = document.getElementById("shopping-list");
        let button = document.querySelectorAll(".button");
        let currentColor;
        


        for (let i = 0; i < button.length; i++) {
          button[i].onclick = function() {
    
 
            button.forEach(btn => btn.classList.remove("mystyle"))


            button[i].classList.toggle("mystyle")
             currentColor = "#"+(button[i].className.split(" ")[0]);
            
          };
        }

        addButton.addEventListener("click", function () {
            const itemValue = inputField.value;
            const itemColor = currentColor;
            const currentUser = currentUserId;
            console.log(currentUserId)
            pushToDatabase(userShoppingListRef, { currentUser:currentUserId, value: itemValue, color: itemColor });
            clearInputFields();
        });

        sortButton.addEventListener("click", function () {


            let values = {'#F8C0C8': 1, '#B8E2F2': 2, '#FFFFF0': 3}

        console.log(shoppingListData)
            
          const sortedData =  shoppingListData.sort((a,b) => {

                let valueA = values[a.color]
                let valueB = values[b.color]
                

               return valueA - valueB

            })

          
            clearShoppingList();

            for (const item of sortedData) {
                console.log(item)
                addShoppingListItem(item.key, item.value, item.color);
             
            }

        });

        onDatabaseValueChange(userShoppingListRef, function (snapshot) {
            if (snapshot.exists()) {
                shoppingListData = []
                clearShoppingList();
                const items = Object.entries(snapshot.val())
                
                
                for (const [key, item] of items) {
                    shoppingListData.push({key,key, color: item.color, value: item.value });
                    addShoppingListItem(key, item.value, item.color);
                    
                }
            } else {
                shoppingListContainer.innerHTML = "No items here... yet";
            }
        });

        function clearShoppingList() {
            shoppingListContainer.innerHTML = "";
        }

        function clearInputFields() {
            inputField.value = "";
        }

    


        
        function addShoppingListItem(itemKey, itemValue, itemColor) {
            const listItem = document.createElement("li");
            listItem.textContent = itemValue;
            listItem.style.backgroundColor = itemColor;

            listItem.addEventListener("click", function () {
                const itemRef = databaseRef(database, `users/${currentUserId}/shoppingList/${itemKey}`);
                removeFromDatabase(itemRef);
            });

            shoppingListContainer.append(listItem);
        }
    })
    .catch((error) => {
        console.error("Error signing in anonymously:", error);
    });

