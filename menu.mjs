let stats = {
    "stars": 11,
    "artifacts": 0,
    "art": 0,
    "energy-crystals": 0
}

function updateStat(name, value = 1) {
    stats[name] += value;
    document.getElementById("collected-" + name).innerText = stats[name];
}

function createMenu() {
    let menu = document.createElement('div');
    menu.id = 'main-menu';
    menu.classList.add('panel');
    menu.classList.add('centered-panel');
    menu.innerHTML = `
        <div class="tabs">
            <div class="tab active" onclick="openTab(event, 'tab1')">Stats</div>
            <div class="tab" onclick="openTab(event, 'tab2')">Controls</div>
        </div>
        <div id="tab1" class="tab-content active">
            <div class="collection">Stars discovered: <span id="stars-discovered">11</span></div>
            <div class="collection">Artifacts: <span id="collected-artifacts">0</span></div>
            <div class="collection">Art: <span id="collected-art">0</span></div>
            <div class="collection">Energy crystals: <span id="collected-energy-crystals">0</span></div>
        </div>
        <div id="tab2" class="tab-content">
            <div class="key"><key>&#8593;</key>/<key>W</key> Move forwards</div>
            <div class="key"><key>&#8595;</key>/<key>A</key> Move backwards</div>
            <div class="key"><key>&#8592;</key>/<key>S</key> Turn left</div>
            <div class="key"><key>&#8594;</key>/<key>D</key> Turn right</div>
            <div class="key"><key>Shift</key> Accelerate</div>
            <div class="key"><key>Space</key> Jump</div>
            <div class="key"><key>C</key> Collect artifact</div>
            <div class="key"><key>Esc</key> Return to star chart</div>
            Click on world to toggle mouse look
        </div>
        `;
    document.body.appendChild(menu);
    const tabs = document.getElementsByClassName("tab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener("click", function(evt) {
            openTab(evt, this.id);
        });
    }
    document.addEventListener('keydown', function(e) {
        if( e.code === "Slash" ) {
            e.preventDefault();
            const menu = document.getElementById("main-menu");
            menu.style.display = (menu.style.display === "block") ? "none" : "block";
        }
    });
    return menu;
}

function openTab(evt, tabName) {
    if( tabName === "" )  return;
    // Hide all tab content sections
    var tabContent = document.getElementsByClassName("tab-content");
    for (var i = 0; i < tabContent.length; i++) {
      tabContent[i].style.display = "none";
    }
  
    // Remove "active" class from all tabs
    var tabs = document.getElementsByClassName("tab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active");
    }
  
    // Show the selected tab content and set it as active
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
  }
  
createMenu();