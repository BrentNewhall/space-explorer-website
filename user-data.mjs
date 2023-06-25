let user_data = {
    "stars": 0,
    "artifacts": 0,
    "energy_crystals": 0,
    "heat_crystals": 0,
    "machines": 0
}

function updateLocalUserData(stat, value = 1) {
    if( stat in user_data ) {
        user_data[stat] += parseInt(value);
        if( stat == "stars" ) {
            document.getElementById("stars-discovered").innerText = user_data[stat];
        }
        else {
            document.getElementById("collected-" + stat.replace("_","-")).innerText = user_data[stat];
        }
    }
}

function updateUserDataFromWeb( field, data ) {
    if( field in data ) {
        updateLocalUserData( field, data[field] );
    }
}

function getUserDataWeb(user_id) {
    const body = {
        "action": "get-user-data",
        "id": user_id
    }
    const options = {
            method: "POST",
            mode: "cors",
            body: JSON.stringify(body)
    }
    fetch("https://t39cwu86h6.execute-api.us-east-1.amazonaws.com/dev/artifacts", options)
    .then(data => data.json())
    .then(data => {
        updateUserDataFromWeb("stars", data);
        updateUserDataFromWeb("artifacts", data);
        updateUserDataFromWeb("energy_crystals", data);
        updateUserDataFromWeb("heat_crystals", data);
        updateUserDataFromWeb("machines", data);
    });
}

function sendUserDataWeb(user_id) {
    const body = {
        "action": "update-user-data",
        "id": user_id,
        "data": user_data
    }
    const options = {
            method: "POST",
            mode: "cors",
            body: JSON.stringify(body)
    }
    fetch("https://t39cwu86h6.execute-api.us-east-1.amazonaws.com/dev/artifacts", options)
    .then(data => data.json())
    .then(() => {
        // Data updated successfully.
    });
}

export { getUserDataWeb, sendUserDataWeb, updateLocalUserData }