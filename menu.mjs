function createMenu() {
    let menu = document.createElement('div');
    menu.id = 'main-menu';
    menu.classList.add('panel');
    menu.classList.add('centered-panel');
    menu.innerHTML = `
        <div class="tabs">
            <div class="tab active" id="tab-1">Stats</div>
            <div class="tab" id="tab-2">Controls</div>
        </div>
        <div id="tab1" class="tab-content active">
            <table><tbody>
            <tr><td class="collection">Stars discovered:</td><td id="stars-discovered">11</td></tr>
            <tr><td colspan="2"><h2>Collections</h2></td></tr>
            <tr><td class="collection">Artifacts:</td><td id="collected-artifacts">0</td></tr>
            <tr><td class="collection">Energy crystals:</td><td id="collected-energy-crystals">0</td></tr>
            <tr><td class="collection">Heat Crystals:</td><td id="collected-heat-crystals">0</td></tr>
            <tr><td class="collection">Machines:</td><td id="collected-machines">0</td></tr>
            </tbody></table>
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
        </div>`;
    document.body.appendChild(menu);
    const tabs = document.getElementsByClassName("tab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener("click", function(evt) {
            openTab(evt, evt.target.id.replace("-",""));
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