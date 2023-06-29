let user_data = {
    "loaded": false,
    "stars": 0,
    "artifacts": 0,
    "energy_crystals": 0,
    "heat_crystals": 0,
    "machines": 0
}

function updateCollectionPanel(user_data) {
    document.getElementById("stars-discovered").innerText = user_data.stars;
    document.getElementById("collected-artifacts").innerText = user_data.artifacts;
    document.getElementById("collected-energy-crystals").innerText = user_data.energy_crystals;
    document.getElementById("collected-heat-crystals").innerText = user_data.heat_crystals;
    document.getElementById("collected-machines").innerText = user_data.machines;
}

function updateLocalUserData(stat, value = 1) {
    if( stat in user_data ) {
        user_data[stat] += parseInt(value);
    }
}

function updateUserDataFromWeb( field, data ) {
    if( field in data ) {
        updateLocalUserData( field, data[field] );
    }
}

function getUserDataWeb(user_id, updatePanel = false) {
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
        if( updatePanel ) {
            updateCollectionPanel(user_data);
        }
        user_data["loaded"] = true;
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

export { getUserDataWeb, sendUserDataWeb, updateLocalUserData, user_data }