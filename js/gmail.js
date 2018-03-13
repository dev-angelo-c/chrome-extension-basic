// TODO GET GMAIL WORKING

//http://stackoverflow.com/questions/31741960/sending-mail-from-chrome-extension-using-auth-2-0-but-stuck-at-somewhere-i-dont

console.log("SENDING GMAIL!")

function sendMessage(userId, to, subject, email) {
    authUser(function() {
        var base64EncodedEmail = btoa(email);
        var request = gapi.client.gmail.users.messages.send({
            'userId': userId,
            'message': {
                'raw': base64EncodedEmail,
                'headers': [
                    {'To': to}, 
                    {'Subject': subject}
                ]
            }
        });
        request.execute();
    });
}

function authUser(callback) {
    chrome.identity.getAuthToken({'interactive': true}, function(token) {
        // load Google's javascript client libraries
        var url = "https://www.googleapis.com/gmail/v1/users/me/messages/send?access_token=" + token;
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState !== 4 || request.status !== 200) {
                return;
            }
            var response = JSON.parse(request.responseText);
            console.log(response);
            callback();
        };
        request.open('POST', url, true);
        request.send();
        request.setRequestHeader('Authorization', 'Bearer ' + token);
    });
}

var buttons = document.getElementsByTagName('button');
console.log(buttons);
buttons[0].addEventListener('click', function(e){
  console.log("heard button click", e);
})
