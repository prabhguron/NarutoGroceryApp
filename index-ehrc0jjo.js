import { initializeApp as initializeFirebaseApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase as getFirebaseDatabase, ref as databaseRef, push as pushToDatabase, onValue as onDatabaseValueChange, remove as removeFromDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth as getFirebaseAuth, signInAnonymously as signInAnonymouslyWithFirebase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

const firebaseConfig = {
    apiKey: "AIzaSyBtcPPVvIyI6iaSlpriHIBD7h2dhc_IQYM",
    authDomain: "grocery-helper-653fd.firebaseapp.com",
    databaseURL: "https://grocery-helper-653fd-default-rtdb.firebaseio.com",
    projectId: "grocery-helper-653fd",
    storageBucket: "grocery-helper-653fd.appspot.com",
    messagingSenderId: "487658271712",
    appId: "1:487658271712:web:3df26249ca7f1200d37185"
};

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
        const inputColor = document.getElementById("input-color");
        const addButton = document.getElementById("add-button");
        const sortButton = document.getElementById("sort-button");
        const shoppingListContainer = document.getElementById("shopping-list");

        addButton.addEventListener("click", function () {
            const itemValue = inputField.value;
            const itemColor = inputColor.value;
            pushToDatabase(userShoppingListRef, { value: itemValue, color: itemColor });
            clearInputFields();
        });

        sortButton.addEventListener("click", function () {
            
            let values = {red: 1, yellow: 2, green: 3}

        console.log(shoppingListData)
            
          const sortedData =  shoppingListData.sort((a,b) => {

                let valueA = values[a.color]
                let valueB = values[b.color]

               return valueA - valueB

            })

          
            clearShoppingList();

            for (const item of sortedData) {
                addShoppingListItem("id", item.value, item.color);
             
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
            inputColor.value = "";
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
