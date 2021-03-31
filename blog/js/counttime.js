var cjhurl;
cjhurl = window.location.host;
pthurl = window.location.pathname;
var lang = navigator.language||navigator.userLanguage;//常规浏览器语言和IE浏览器
lang = lang.substr(0, 2);//截取lang前2位字符

if(cjhurl == 'cjh0613.com'){}
else if(cjhurl == '127.0.0.1:4000'){}
else{pthurl=pthurl.replace('/blog','');
    window.location.href="https://cjh0613.com"+pthurl;}

$(document).ready(function () {
var $runtimeCount = $('#webinfo-runtime-count')
    var startDate = $runtimeCount.attr('start_date')
    var showDateTime = function () {
      var BirthDay = new Date(startDate)
      var today = new Date()
      var timeold = (today.getTime() - BirthDay.getTime())
      var daysold = Math.floor(timeold / (24 * 60 * 60 * 1000))
      $('#webinfo-runtime-count').text(daysold + ' ' + '天')
    }
    var interval
    showDateTime()
    clearInterval(interval)
    interval = setInterval(showDateTime, 10000)
    //$(".post").prepend('<div class="post-excerpt"><div class="note-plugin success no-icon"><p>如果有兴趣，可以关注一下 <strong>TreeCard</strong> ——<br>世界上第一款木制借记卡，万事达卡，境外机构发行，免费。最易申请、最优惠的境外卡。<br>12.1 前可以免费申请。可以查看我写的这篇指南<a href="/20201029treecard.html">TreeCard木制万事达借记卡申请指南</a>了解更多。</p></div></div>');


    $(".reward-qrcode").attr("style","opacity: 1; display: block; transform: translateY(0px);");});