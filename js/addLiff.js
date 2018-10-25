const liffUrl = "https://api.line.me/liff/v1/apps";
const pages = {
    'My LINE Profile': 'myLineProfile.html'
};

window.onload = function () {
    $("#registerButton").on("click", registerButtonClick);
    $("#addLiff").on("click", addLiffButtonClick);

    createLinkList();
    SetDataFromSessionStorage();
};

var registerButtonClick = function () {
    var accessToken = $("#accessTokenField").val();
    if (accessToken === "" || accessToken === null) {
        return;
    }
    listLiff(accessToken);
};

var addLiffButtonClick = function () {
    var accessToken = $("#accessTokenField").val();
    if (accessToken === "" || accessToken === null) {
        return;
    }

    var url = $("#url").val();
    var type = $("input[type='radio']:checked").attr('id');
    addLiff(accessToken, url, type);
};

function SetDataFromSessionStorage() {
    var accessToken = this.sessionStorage.getItem("ChannelAccessToken");
    if (accessToken === "" || accessToken === null) {
        return;
    }
    $("#accessTokenField").val(accessToken);
    listLiff(accessToken);
}

function createLinkList() {
    for (key in pages) {
        var linkUrl = location.href.replace('index.html', '') + pages[key];
        $("#links").append(
            `<div class="item">
    <div class="content">
    <button class="right floated ui button setUrl" data-url="${linkUrl}">Set to "Add LIFF"</button>
        <a class="header">${key}</a>
        <a href="${linkUrl}">${linkUrl}</div>
    </div>
</div>`);
    }
    $(".setUrl").on("click", function () {
        $("#url").val($(this).data("url"));
    });
}

function listLiff(accessToken) {
    $.ajax({
        url: liffUrl,
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        }

    }).done(function (result) {
        $("#cards").empty();
        for (let liff of result.apps) {
            var card = `<div class='card'>
    <div class='content'>
        <div class='header' id='id-${liff.liffId}'>line://app/${liff.liffId}</div>
        <div class='meta'>View Type: ${liff.view.type}</div>
        <div class='description'>URL: <a href ='${liff.view.url}'>${liff.view.url}</a></div>
    </div >
    <div class='extra content'>
        <button class='ui basic green button copyUrlButton' data-liffid='${liff.liffId}'>Copy LIFF URL</button>
    </div>
</div >`;
            $("#cards").append(card);
        }

        $(".copyUrlButton").on("click", function () {
            var liffId = $(this).data("liffid");
            copyToClipboard('id-' + liffId);
        });
        sessionStorage.setItem("ChannelAccessToken", accessToken);
        $("#registerButton").empty();
        $("#registerButton").append('<i class="ui green check icon"></i>Verify');
    }).fail(function (xhr) {
        $("#registerButton").empty();
        if (xhr.status !== 404) {
            $("#registerButton").append('Verify');
            alert("Failed! Invalid AccessToken.");
        } else {
            sessionStorage.setItem("ChannelAccessToken", accessToken);
            $("#registerButton").append('<i class="ui green check icon"></i>Verify');
        }
    });
}

function addLiff(accessToken, url, viewType) {
    var body = JSON.stringify({
        'view': {
            'type': viewType,
            'url': url
        }
    });
    $.ajax({
        url: liffUrl,
        type: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
        data: body
    }).done(function () {
        listLiff(accessToken);
    }).fail(function () {
        alert("Failed.");
    });
}

function deleteLiff(liffId) {
    var accessToken = sessionStorage.getItem("ChannelAccessToken");
    $.ajax({
        url: liffUrl + "/" + liffId,
        type: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    }).done(function () {
        listLiff(accessToken);
    }).fail(function () {
        alert("Failed.");
    });
}