//Nhập Key Open AI bên dưới https://platform.openai.com/account/api-keys
var Key_OpenAI = "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";
var microSpeak = null

function BodyLoader() {
    if ("webkitSpeechRecognition" in window) {} else {
        //Check Không hỗ trợ micro
        lblSpeak.style.display = "none";
    }
}

function NgonNgu(o) {
        if (microSpeak) {
            microSpeak.lang = selLang.value;
        }
    }
    //Auto Cuộn chuột chatbox
function ScrollTextarea() {
    var objDiv = document.getElementById("txtOutput");
    objDiv.scrollTop = objDiv.scrollHeight;
}

function toggleVisibility(id) {
    var el = document.getElementById(id);
    if (el.style.visibility == "visible") {
        el.style.visibility = "hidden";
    } else {
        el.style.visibility = "visible";
    }
}

function NextData() {
        var zDiv = document.getElementById("zidText");
        zDiv.innerHTML = '';
        var sQuestion = txtMsg.value;
        if (sQuestion == "") {
            //alert("Nhập Câu Hỏi Của Bạn");
            zDiv.innerHTML = 'Vui Lòng Nhập Câu Hỏi, Văn Bản Hoặc Bạn Có Thể Nói';
            txtMsg.focus();
            return;
        }
        var DataPost = new XMLHttpRequest();
        DataPost.open("POST", "https://api.openai.com/v1/completions");
        DataPost.setRequestHeader("Accept", "application/json");
        DataPost.setRequestHeader("Content-Type", "application/json");
        DataPost.setRequestHeader("Authorization", "Bearer " + Key_OpenAI)
        DataPost.onreadystatechange = function() {
            if (DataPost.readyState === 4) {
                var oJson = {}
                try {
                    oJson = JSON.parse(DataPost.responseText);
                } catch (ex) {
                    txtOutput.value += "Lỗi: " + ex.message
                }
                if (oJson.error && oJson.error.message) {
                    txtOutput.value += "Lỗi: " + oJson.error.message;
                } else if (oJson.choices && oJson.choices[0].text) {
                    var s = oJson.choices[0].text;
                    if (selLang.value != "vi-VN") {
                        var a = s.split("?\n");
                        if (a.length == 2) {
                            s = a[1];
                        }
                    }
                    if (s == "") s = "Không Có Phản Hồi";
                    txtOutput.value += "\nChat Bot_GPT: " + s.trim() + "\n";
                    ScrollTextarea();
                }
            }
        };
        var sModel = selModel.value; //Mặc Định: "text-davinci-003";
        var iMaxTokens = 2048;
        var sUserId = "1";
        var dTemperature = 0.5;
        var data = {
            model: sModel,
            prompt: sQuestion,
            max_tokens: iMaxTokens,
            user: sUserId,
            temperature: dTemperature,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            stop: ["#", ";"]
        }
        DataPost.send(JSON.stringify(data));
        if (txtOutput.value != "") txtOutput.value += "\n";
        txtOutput.value += "Tôi: " + sQuestion;
        txtMsg.value = "";
        ScrollTextarea();
    }
    //Chuyển Giọng nói sang văn bản
function SpeakKToText() {
    if (microSpeak) {
        if (SpkText.checked) {
            microSpeak.start();
        } else {
            microSpeak.stop();
        }
        return;
    }
    microSpeak = new webkitSpeechRecognition();
    microSpeak.continuous = true;
    microSpeak.interimResults = true;
    microSpeak.lang = selLang.value;
    microSpeak.start();
    microSpeak.onresult = function(event) {
        var interimTranscripts = "";
        for (var i = event.resultIndex; i < event.results.length; i++) {
            var transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                txtMsg.value = transcript;
                NextData();
            } else {
                transcript.replace("\n", "<br>");
                interimTranscripts += transcript;
            }
            var oDiv = document.getElementById("idText");
            //oDiv.innerHTML = 'Chuyển Giọng Nói Thành Văn Bản: <span>' + interimTranscripts + '</span>';
            oDiv.innerHTML = interimTranscripts;
        }
    };
    microSpeak.onerror = function(event) {};
}