// GPL: https://github.com/passff/passff

function fireEvent(el, name) {
    el.dispatchEvent(new Event(
            name, 
            {
                'bubbles': true,
                'composed': true,
                'cancelable': true
            }
        )
    );
}

function fillCredentials() {

    const inputs = document.querySelectorAll('input');

    let usernameInput = null;
    let passwordInput = null;

    for(i of inputs) {
        if (i.offsetParent === null) {
            continue;
        }
        const itype = i.type.toLowerCase();
        if( (itype === 'text') && (passwordInput == null)) {
            usernameInput = i;
        } 
        if( (itype === 'email') && (passwordInput == null)) {
            usernameInput = i;
        } 
        if(itype === 'password') {
            passwordInput = i;
        } 
        if(usernameInput && passwordInput) {
            break;
        }
    }
    if(usernameInput && passwordInput) {
        console.log('done');
        console.log(loginRequestJson);
        console.log(inputs);

        console.log(usernameInput);
        console.log(passwordInput);

        usernameInput.value = loginRequestJson.username;
        fireEvent(usernameInput, "input");
        fireEvent(usernameInput, "change");

        passwordInput.value = loginRequestJson.password;
        fireEvent(passwordInput, "input");
        fireEvent(passwordInput, "change");
    } else {
        setTimeout(fillCredentials, 100);
    }
}

setTimeout(fillCredentials, 100);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('contentScript')
    console.log(message)
    return true
});
