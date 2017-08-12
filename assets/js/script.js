/*Todo:

*/

let bio = [];

let userMonster;
let enemyMonster;

//Monster Dex
let monsters;
let easy = [];
let medium = [];
let hard = [];
let boss = [];

//Game Configurables
let gameLen = 10;
let level = 0;
let dodgeFactor = .5;
let difficulty = .8;

$(document).ready(function () {

    $.ajax({
        crossOrigin: false,
        dataType: 'json',
        url: "../monster_island/assets/data/monsters.json",
        type: "GET",
        success: function (data) {
            monsters = data;

        }
    })

    $("#initial-modal-submit").on("click", function () {
        let con = $('#con-select').find(":selected").text().toLowerCase();
        let env = $('#env-select').find(":selected").text().toLowerCase();
        let soc = $('#soc-select').find(":selected").text().toLowerCase();
        bio.push(con, env, soc);
        getMonster(bio);
        userMonster.currentHealth = userMonster.mHealth;
        updateUserMonster();
        level++;
        enemyMonster = getEnemyMon(calcDifficulty(level));
        enemyMonster.currentHealth = enemyMonster.mHealth;
        updateEnemyMonster()
    });

    $("#attack-submit").click(function () {
        $("#attack-submit").prop("disabled", true);
        setTimeout(function () {
            $("#attack-submit").prop("disabled", false);
        }, 1000);

        combat();
    })
})

function updateUserMonster() {
    $("#usr-monster-name").html(userMonster.mName);
    $("#usr-monster-img").attr("src", userMonster.mImage);
    $("#usr-monster-health").attr("aria-valuemax", userMonster.mHealth);
    $("#usr-monster-health").width((userMonster.currentHealth / userMonster.mHealth * 100) + "%");
    $("#usr-monster-health").html("HP: " + 10 * userMonster.currentHealth);
};

function updateEnemyMonster() {
    $("#enemy-monster-name").html(enemyMonster.mName);
    $("#enemy-monster-img").attr("src", enemyMonster.mImage);
    $("#enemy-monster-health").attr("aria-valuemax", enemyMonster.mHealth);
    $("#enemy-monster-health").width((enemyMonster.currentHealth / enemyMonster.mHealth * 100) + "%");
    $("#enemy-monster-health").html("HP: " + 10 * enemyMonster.currentHealth);
};

function getMonster(bio) {
    let matches = [];
    Object.keys(monsters).forEach(function (key) {

        //Sort monsters into category by stat type for later
        let stats = monsters[key].mAttack + monsters[key].mHealth + monsters[key].mSpeed
        if (stats > 34) {
            boss.push(monsters[key]);
        }
        else if (stats < 34 && stats > 24) {
            hard.push(monsters[key]);
        }
        else if (stats < 24 && stats > 16) {
            medium.push(monsters[key]);
        }
        else {
            easy.push(monsters[key]);
        }

        //Find a monster that matches user request
        if (monsters[key].mClass[0] === bio[0]) {
            if (monsters[key].mClass[1] === bio[1]) {
                if (monsters[key].mClass[2] === bio[2]) {
                    matches.push(monsters[key])
                }
            }
        }
    })
    userMonster = (matches[Math.floor(Math.random() * matches.length)]);
}

function getEnemyMon(difficulty) {
    if (difficulty === "easy") {
        return enemyMonster = easy[Math.floor(Math.random() * easy.length)];
    } else if (difficulty === "medium") {
        return enemyMonster = medium[Math.floor(Math.random() * medium.length)];
    } else if (difficulty == "hard") {
        return enemyMonster = hard[Math.floor(Math.random() * hard.length)];
    } else {
        rand = Math.floor(Math.random() * boss.length);
        return enemyMonster = boss[rand];
    }
}

function calcDifficulty(level) {
    let rand = (Math.random() * gameLen);
    if (level <= (gameLen * .5)) {
        let easyP = gameLen - level;
        if (rand <= easyP) {
            return "easy"
        } else {
            return "medium"
        }
    }
    else if (level > (gameLen * .5) && level <= gameLen) {
        let mediumP = gameLen - level;
        if (rand <= mediumP) {
            return "medium"
        } else {
            return "hard"
        }
    }
    else {
        return "boss";
    }
}

//TODO: Refactor me to be more DRY
function combat() {
    if ((level <= gameLen) && (userMonster.mHealth !== 0 || enemyMonster.mHealth !== 0)) {
        if (userMonster.mSpeed > enemyMonster.mSpeed) {
            console.log(userMonster.mName + " attacks first");
            attack(userMonster, enemyMonster);
            updateEnemyMonster();
            attack(enemyMonster, userMonster);
            updateUserMonster();
            if (userMonster.currentHealth <= 0) {
                console.log("lose");
                $("#battletext").append("<h3>You were defeated</h3>");
                $('#battletext').children().fadeOut(800, function () {
                    $('#battletext').empty();
                })
                showModal("lose");
            }
            else if (enemyMonster.currentHealth <= 0) {
                console.log("win");
                $("#battletext").append("<h3>" + userMonster.mName + " defeated" + enemyMonster.mName + "</h3>");
                $('#battletext').children().fadeOut(800, function () {
                    $('#battletext').empty();
                });
                showModal("win");
            }
        } else {
            console.log(enemyMonster.mName + " attacks first");
            attack(enemyMonster, userMonster);
            updateUserMonster();
            attack(userMonster, enemyMonster);
            updateEnemyMonster();
            if (userMonster.currentHealth <= 0) {
                console.log("lose");
                $("#battletext").append("<h3>You were defeated</h3>");
                $('#battletext').children().fadeOut(800, function () {
                    $('#battletext').empty();
                })
                showModal("lose");
            }
            else if (enemyMonster.currentHealth <= 0) {
                console.log("win");
                $("#battletext").append("<h3>" + userMonster.mName + " defeated" + enemyMonster.mName + "</h3>");
                $('#battletext').children().fadeOut(800, function () {
                    $('#battletext').empty();
                });
                showModal("win");
            }
        }
    }
}

function attack(monster1, monster2) {
    if (Math.random() * 10 < (monster2.mSpeed * dodgeFactor)) {
        $("#battletext").append("<h3>" + monster2.mName + " successfuly dodged</h3>");

        $('#battletext').children().fadeOut(800, function () {
            $('#battletext').empty();
        })
    } else {
        console.log()
        monster2.currentHealth = monster2.currentHealth - monster1.mAttack
        $("#battletext").append("<h3>" + monster1.mName + " attacked " + monster2.mName + "</h3>");
        $('#battletext').children().fadeOut(800, function () {
            $('#battletext').empty();
        })
    }
}

function gameLoop() {
    if (level < gameLen) {
        levelUp(userMonster, enemyMonster);
        updateUserMonster();
        level++;
        enemyMonster = getEnemyMon(calcDifficulty(level));
        scaleDifficulty();
        enemyMonster.currentHealth = enemyMonster.mHealth;
        updateEnemyMonster();
    }
}

function levelUp(monster1, monster2) {
    let diff = (level * difficulty);
    monster1.mAttack = monster1.mAttack +  Math.floor(monster2.mAttack * diff);
    monster1.mHealth = monster1.mHealth +  Math.floor(monster2.mHealth * diff);
    monster1.currentHealth = monster1.mHealth;
}

function scaleDifficulty() {
    let diff = (level * difficulty);
    enemyMonster.mAttack = enemyMonster.mAttack + (Math.floor(enemyMonster.mAttack * diff) * level);
    enemyMonster.mHealth = enemyMonster.mHealth + (Math.floor(enemyMonster.mHealth * diff) * level);
}

function showModal(status) {

    $('#' + status).modal({
        backdrop: 'static',
        keyboard: false
    })
    $('#' + status).modal('show');
    gameLoop();
}