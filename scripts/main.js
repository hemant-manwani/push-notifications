let serviceWorker = null;let appPublicKey = null;
const pushButton = document.querySelector(".push-button");
const sendNotification = document.querySelector(".submit-text");
const message = document.querySelector(".push-notification-text");
let isUserSubscribed = false;
const init = function(){
  const promise = new Promise(getClientToken);
  promise.then(proceedWithToken, abort);
}
const proceedWithToken = function(result){
  appPublicKey = JSON.parse(result).data;
  initializeUI(appPublicKey);
}
const abort = function(result){
  console.log(result);
}
const getClientToken = function(resolve, reject){
  let xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://localhost:8080/client-token', true);
  xhr.setRequestHeader('Access-Control-Allow-Origin','*');
  xhr.withCredentials = true;
  xhr.send(null);
  xhr.onreadystatechange = function(){

    if(xhr.readyState == 4 && xhr.status == 200){
      resolve(xhr.responseText);
    }
  }
}
const registerServiceWorker = function(){
  if('serviceWorker' in navigator && 'PushManager' in window){
    navigator.serviceWorker.register('sw.js')
    .then(function(sw){
      serviceWorker = sw;
      init();
    })
    .catch(function(error){
      console.log("There was some error in registering service worker" + error)
    })
  }
}
const initializeUI = function(appPublicKey){
  serviceWorker.pushManager.getSubscription()
  .then(function(subscription){
    isUserSubscribed = !(subscription === null);
    updateSubscriptionOnServer(subscription);
    if(isUserSubscribed)
      console.log("User is subscribed");
    else
      console.log("User is not subscribed");
    updateButton();
  });
  const clickPushButton = function(){
    pushButton.disabled = true;
    if(isUserSubscribed)
      unsubscribeUser();
    else
      subscribeUser();
  }
  const updateButton = function(){
    if(Notification.permission == "denied"){
      pushButton.textContent = "Push Messages are blocked";
      pushButton.disabled = true;
      updateSubscriptionOnServer(null);
      return;
    }
    if(isUserSubscribed)
      pushButton.textContent = "Disable push messaging";
    else
      pushButton.textContent = "Enable push messaging";
    // pushButton.disabled = true;
  }
  const sendMessage = function(){
    notification = message.value;
    if(notification == null)
      return;
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:8080/send-message', true);
    xhr.setRequestHeader('Access-Control-Allow-Origin','*');
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.withCredentials = true;
    var data  = JSON.stringify({message: notification, to: appPublicKey});
    xhr.send(data);
    xhr.onreadystatechange = function(){
      if(xhr.readyState == 4 && xhr.status == 200){
        resolve(xhr.responseText);
      }
    }
  }
  pushButton.addEventListener('click', clickPushButton);
  sendNotification.addEventListener("click", sendMessage);
}
const subscribeUser = function(){
  appServerKey = urlB64ToUint8Array(appPublicKey);
  serviceWorker.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: appServerKey
  })
  .then(function(subscription){
    updateSubscriptionOnServer(subscription);
    isUserSubscribed = true;
    updateButton();
  })
  .catch(function(error){
    console.log("Failed to subscribe User" + error);
  })
}
const unsubscribeUser = function(){
  serviceWorker.pushManager.getSubscription()
  .then(function(subscription){
    if(subscription)
      subscription.unsubscribe();
  })
  .catch(function(error){
    console.log("Unable to unsubscribe user");
  })
  .then(function(){
    updateSubscriptionOnServer(null);
    console.log("User is unsubscribed");
    isUserSubscribed = false;
    updateButton();
  })
}
const urlB64ToUint8Array = function(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
const updateSubscriptionOnServer = function(subscription){
  console.log("Subscription details should go to server database");
}
window.onload = function(){
  registerServiceWorker();

}
