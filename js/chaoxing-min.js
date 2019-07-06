var setting = {
    
    time: 5E3 
    ,token: '' 
    ,safe: 0 

  
    ,video: 1 
    ,work: 1 
    ,audio: 1 
    ,book: 1 
    ,docs: 1
    
    ,jump: 1 
    ,read: 0 
    ,face: 0 
    ,login: 0 
   
    ,line: '公网1' 
    ,http: '极速' 
    ,muted: 0 
    ,drag: 0 
    ,player: '' 
    ,phone: 0 
    
    ,auto: 1 
    ,none: 1 
    ,wait: 5E3
    ,paste: 1 
    ,scale: 0 

    
    ,check: 1 
    ,course: 0 

    ,goal: 65 

    
    ,school: '' 
    ,username: '' 
    ,password: '' 
},
_self = unsafeWindow,
url = location.pathname,
top = _self;

try {
    while (top != _self.top) top = top.parent.document ? top.parent : _self.top;
} catch (err) {
    
    top = _self;
}

var $ = _self.jQuery || top.jQuery,
Ext = _self.Ext,
UE = _self.UE,
Hooks = Hooks || window.Hooks,
parent = _self == top ? {} : _self.parent;




setting.job = [
    'iframe[src*="/video/index.html"]',
    'iframe[src*="/work/index.html"]',
    'iframe[src*="/audio/index.html"]',
    'iframe[src*="/innerbook/index.html"]',
    'iframe[src*="/ppt/index.html"]',
    'iframe[src*="/pdf/index.html"]'
].join(', ');
setting.tip = top != _self && $ && jobSort();

if (url == '/ananas/modules/video/index.html') {
    if (setting.video) {
        checkPlayer();
    } else if ($) {
        getIframe(0).remove();
    }
} else if (url == '/work/doHomeWorkNew') {
    if (setting.work) {
        setTimeout(relieveLimit, setting.time / 2);
        beforeFind();
    } else {
        getIframe(0).remove();
    }
} else if (url == '/ananas/modules/audio/index.html') {
    if (setting.audio) {
        hookAudio(_self.videojs, _self.videojs.xhr);
    } else if ($) {
        getIframe(0).remove();
    }
} else if (url == '/ananas/modules/innerbook/index.html') {
    if (setting.book) {
        setTimeout(bookRead, setting.time);
    } else if ($) {
        getIframe(0).remove();
    }
} else if (url.match(/^\/ananas\/modules\/(ppt|pdf)\/index\.html$/)) {
    if (setting.docs) {
        setTimeout(docsRead, setting.time);
    } else if ($) {
        getIframe(0).remove();
    }
} else if (url == '/knowledge/cards') {
    $ && checkToNext();
} else if (url.match(/^\/(course|zt)\/\d+\.html$/)) {
    setTimeout(function() {
        setting.read && _self.sendLogs && $('.course_section:first .chapterText').click();
    }, setting.time);
} else if (url == '/ztnodedetailcontroller/visitnodedetail') {
    setting.read && _self.sendLogs && autoRead();
} else if (url == '/mycourse/studentcourse') {
    goCourse();
} else if (url.match(/^\/visit\/(courses|interaction)$/)) {
    setting.face && DisplayURL();
} else if (location.host.match(/^passport2/)) {
    setting.login && getSchoolId();
} else if (url == '/work/selectWorkQuestionYiPiYue') {
    submitAnswer(getIframe(0).parent(), $.extend(true, [], parent._data));
}

function getIframe(tip, win, job) {
    do {
        win = win ? win.parent : _self;
        job = $(win.frameElement).prevAll('.ans-job-icon');
    } while (!job.length && win.parent.frameElement);
    return tip ? win : job;
}

function jobSort() {
    var win = getIframe(1),
    $job = $('.ans-job-icon', win.parent.document).nextAll(setting.job).not('.ans-job-finished > iframe');
    if (!getIframe(0).length) {
    } else if ($job[0] == win.frameElement) {
        return true;
    } else {
        setInterval(function() {
            $job.filter('.ans-job-icon ~ iframe').not('.ans-job-finished > iframe')[0] == win.frameElement && location.reload();
        }, setting.time);
    }
}

function checkPlayer() {
    var data = Ext.decode(Ext.fly(frameElement).getAttribute('data')),
    danmaku = data && data.danmaku ? data.danmaku : 0;
    if (setting.player == 'flash') {
        _self.showHTML5Player = _self.showMoocPlayer;
        danmaku = 1;
    } else if (setting.player == 'html5') {
        _self.showMoocPlayer = _self.showHTML5Player;
        danmaku = 0;
    }
    if (!danmaku && _self.supportH5Video() && !navigator.userAgent.match(/metasr/i)) {
        Ext.isChaoxing = Boolean(setting.phone);
        hookVideo(_self.videojs, _self.videojs.xhr);
    } else if (_self.flashChecker().hasFlash) {
        hookJQuery();
    } else {
        alert("此浏览器不支持flash，请修改脚本player参数为'html5'，或者更换浏览器");
    }
}

function hookVideo(Hooks, xhr) {
    _self.videojs = function() {
        _self.videojs = Hooks;
        var config = arguments[1],
        line = Ext.Array.filter(Ext.Array.map(config.playlines, function(value, index) {
            return value.label == setting.line && index;
        }), function(value) {
            return Ext.isNumber(value);
        })[0] || 0,
        http = Ext.Array.filter(config.sources, function(value) {
            return value.label == setting.http;
        })[0];
        config.playlines.unshift(config.playlines[line]);
        config.playlines.splice(line + 1, 1);
        config.plugins.videoJsResolutionSwitcher.default = http ? http.res : 360;
        config.plugins.studyControl.enableSwitchWindow = 1;
        config.plugins.timelineObjects.url = '/richvideo/initdatawithviewer?';
        if (setting.drag) {
            config.plugins.seekBarControl.enableFastForward = 1;
            config.playbackRates = [1, 1.25, 1.5, 2];
        }
        var player = Hooks.apply(this, arguments);
        player.children_[0].muted = setting.muted;
        player.on('loadstart', function() {
            setting.tip && this.play().catch(Ext.emptyFn);
        });
        player.on('ended', function() {
            $ && getIframe(0).parent().addClass('ans-job-finished');
        });
        _self.videojs.xhr = setting.login ? function(options, callback) {
            return xhr.call(this, options, function(error, response) {
                response.statusCode || top.location.reload();
                return callback.apply(this, arguments);
            });
        } : xhr;
        return player;
    };
}

function hookJQuery() {
    Hooks.set(_self, 'jQuery', function(target, propertyName, ignored, jQuery) {
        Hooks.method(jQuery.fn, 'cxplayer', function(target, methodName, method, thisArg, args) {
            var that = this,
            
            config = args[0];
            config.events.onStart = function() {
                for (var i = 0; i < 16; i++) setting.muted && that.addVolNum(false);
                
            };
            config.events.onEnd = function() {
                $ && getIframe(0).parent().addClass('ans-job-finished');
                
            };
            config.datas.isDefaultPlay = setting.tip || false;
            config.enableSwitchWindow = 1;
            config.datas.currVideoInfo.resourceUrl = '/richvideo/initdatawithviewer?';
            config.datas.currVideoInfo.dftLineIndex = Ext.Array.filter(Ext.Array.map(decodeURIComponent(config.datas.currVideoInfo.getVideoUrl).match(/{.+?}/g) || [], function(value, index) {
                return value.match(setting.line + setting.http) && index;
            }), function(value) {
                return Ext.isNumber(value);
            })[0] || 0;
            setting.drag && (config.datas.currVideoInfo.getVideoUrl = config.datas.currVideoInfo.getVideoUrl.replace(/&drag=false&/, '&drag=true&'));
            return Hooks.Reply.method(arguments);
        });
        return Hooks.Reply.set(arguments);
    });
}

function hookAudio(Hooks, xhr) {
    _self.videojs = function() {
        _self.videojs = Hooks;
        var config = arguments[1];
        config.plugins.studyControl.enableSwitchWindow = 1;
        setting.drag && (config.plugins.seekBarControl.enableFastForward = 1);
        var player = Hooks.apply(this, arguments);
        player.children_[0].muted = setting.muted;
        player.on('loadstart', function() {
            setting.tip && this.play().catch(Ext.emptyFn);
        });
        player.on('ended', function() {
            $ && getIframe(0).parent().addClass('ans-job-finished');
        });
        _self.videojs.xhr = setting.login ? function(options, callback) {
            return xhr.call(this, options, function(error, response) {
                response.statusCode || top.location.reload();
                return callback.apply(this, arguments);
            });
        } : xhr;
        return player;
    };
}

function bookRead() {
    setting.tip && top.onchangepage(_self.getFrameAttr('end'));
}

function docsRead() {
    setting.tip && _self.finishJob();
}

function relieveLimit() {
    setting.scale && (_self.UEDITOR_CONFIG.scaleEnabled = false);
    $('.edui-default + textarea').each(function() {
        UE.getEditor($(this).attr('name')).ready(function() {
            this.autoHeightEnabled = true;
            setting.scale && this.enableAutoHeight();
            setting.paste && this.removeListener('beforepaste', _self.myEditor_paste);
        });
    });
    if (!setting.paste) return;
    $('input[onpaste]').removeAttr('onpaste');
    _self.myEditor_paste = $.noop;
    
}

function beforeFind() {
    setting.div = $(
        '<div style="border: 2px dashed rgb(0, 85, 68); width: 330px; position: fixed; top: 0; right: 0; z-index: 99999; background-color: rgba(70, 196, 38, 0.6); overflow-x: auto;">' +
            '<span style="font-size: medium;"></span>' +
            '<div style="font-size: medium;">正在搜索答案...</div>' +
            '<button style="margin-right: 10px;">暂停答题</button>' +
            '<button style="margin-right: 10px;">' + (setting.auto ? '取消本次自动提交' : '开启本次自动提交') + '</button>' +
            '<button style="margin-right: 10px;">重新查询</button>' +
            '<button>折叠面板</button>' +
            '<div style="max-height: 300px; overflow-y: auto;">' +
                '<table border="1" style="font-size: 12px;">' +
                    '<thead>' +
                        '<tr>' +
                            '<th style="width: 25px; min-width: 25px;">题号</th>' +
                            '<th style="width: 60%; min-width: 130px;">题目（点击可复制）</th>' +
                            '<th style="min-width: 130px;">答案（点击可复制）</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tfoot style="display: none;">' +
                        '<tr>' +
                            '<th colspan="3">答案提示框 已折叠</th>' +
                        '</tr>' +
                    '</tfoot>' +
                    '<tbody>' +
                        '<tr>' +
                            '<td colspan="3" style="display: none;"></td>' +
                        '</tr>' +
                    '</tbody>' +
                '</table>' +
            '</div>' +
        '</div>'
    ).appendTo('body').on('click', 'button, td', function() {
        var len = $(this).prevAll('button').length;
        if (this.tagName == 'TD') {
            $(this).prev().length && GM_setClipboard($(this).text());
        } else if (len === 0) {
            if (setting.loop) {
                clearInterval(setting.loop);
                delete setting.loop;
                len = ['已暂停搜索', '继续答题'];
            } else {
                setting.loop = setInterval(findAnswer, setting.time);
                len = ['正在搜索答案...', '暂停答题'];
            }
            setting.div.children('div:eq(0)').html(function() {
                return $(this).data('html') || len[0];
            }).removeData('html');
            $(this).html(len[1]);
        } else if (len == 1) {
            setting.auto = 1 ^ setting.auto;
            $(this).html(setting.auto ? '取消本次自动提交' : '开启本次自动提交');
        } else if (len == 2) {
            location.reload();
        } else if (len == 3) {
            setting.div.find('tbody, tfoot').toggle();
        }
    }).detach(setting.safe ? '*' : 'html');
    setting.lose = setting.num = 0;
    setting.curs = $('script:contains(courseName)', top.document).text().match(/courseName:\'(.+?)\'/);
    setting.curs = (setting.curs ? setting.curs[1] : $('h1').text().trim()) || '无';
    setting.data = parent._data = [];
    setting.loop = setInterval(findAnswer, setting.time);
    setting.tip || setting.div.children('button').eq(0).click();
}

function findAnswer() {
    if (setting.num >= $('.TiMu').length) {
        var arr = setting.lose ? ['共有 <font color="red">' + setting.lose + '</font> 道题目待完善（已深色标注）', saveThis] : ['答题已完成', submitThis];
        setting.div.children('div:eq(0)').data('html', arr[0]).siblings('button:eq(0)').hide().click();
        return setTimeout(arr[1], setting.wait);
    }
    var $TiMu = $('.TiMu').eq(setting.num),
    question = filterImg($TiMu.find('.Zy_TItle:eq(0) .clearfix')).replace(/^【.*?】\s*/, ''),
    type = $TiMu.find('input[name^=answertype]:eq(0)').val() || '-1',
    option = setting.token && $TiMu.find('.clearfix ul:eq(0) li .after').map(function() {
        return filterImg(this);
    }).filter(function() {
        return this.length;
    }).get().join('#');
    GM_xmlhttpRequest({
        method: 'POST',
        url: 'http://mooc.forestpolice.org/cx/' + (setting.token || 0) + '/' + encodeURIComponent(question),
        headers: {
            'Content-type': 'application/x-www-form-urlencoded'
        },
        data: 'course=' + encodeURIComponent(setting.curs) + '&type=' + type + '&option=' + encodeURIComponent(option),
        timeout: setting.time,
        onload: function(xhr) {
            if (!setting.loop) {
            } else if (xhr.status == 200) {
                var obj = $.parseJSON(xhr.responseText) || {};
                if (obj.code) {
                    setting.div.children('div:eq(0)').text('正在搜索答案...');
                    obj.data = filterImg($('<p></p>').append(obj.data).not('script'));
                    $(
                        '<tr>' +
                            '<td style="text-align: center;">' + $TiMu.find('.Zy_TItle:eq(0) i').text().trim() + '</td>' +
                            '<td title="点击可复制">' + question + '</td>' +
                            '<td title="点击可复制">' + (/^http/.test(obj.data) ? '<img src="' + obj.data + '">' : '') + obj.data + '</td>' +
                        '</tr>'
                    ).appendTo(setting.div.find('tbody')).css('background-color', fillAnswer($TiMu.find('ul:eq(0) li'), obj, type) ? '' : 'rgba(0, 150, 136, 0.6)');
                    setting.data[setting.num++] = {
                        code: obj.code > 0 ? 1 : 0,
                        question: question,
                        option: obj.data,
                        type: type
                    };
                } else {
                    setting.div.children('div:eq(0)').html(obj.data || '服务器繁忙，正在重试...');
                }
                setting.div.children('span').html(obj.msg || '');
            } else if (xhr.status == 403) {
                setting.div.children('button').eq(0).click();
                setting.div.children('div:eq(0)').text('请求过于频繁，建议稍后再试');
            } else {
                setting.div.children('div:eq(0)').text('服务器异常，正在重试...');
            }
        },
        ontimeout: function() {
            setting.loop && setting.div.children('div:eq(0)').text('服务器超时，正在重试...');
        }
    });
}

function fillAnswer($li, obj, type) {
    var $input = $li.find(':radio, :checkbox'),
    data = String(obj.data).split(/#|\n\x01\n|\|/),
    state = setting.lose;
    
    obj.code == 1 && $input.each(function(index) {
        if (this.value == 'true') {
            /(^|#)(正确|是|对|√)(#|$)/.test(obj.data) && this.click();
        } else if (this.value == 'false') {
            /(^|#)(错误|否|错|×)(#|$)/.test(obj.data) && this.click();
        } else {
            var tip = filterImg($li.eq(index).find('.after')) || new Date().toString();
            Boolean($.inArray(tip, data) + 1 || (type == '1' && String(obj.data).match(tip))) == this.checked || this.click();
        }
    }).each(function() {
        if (!/^[A]?[B]?[C]?[D]?[E]?[F]?[G]?$/.test(obj.data)) return false;
        Boolean(String(obj.data).match(this.value)) == this.checked || this.click();
    });
    if (type.match(/^[013]$/)) {
        $input.is(':checked') || (setting.none ? ($input[Math.floor(Math.random() * $input.length)] || $()).click() : setting.lose++);
    } else if (type.match(/^(2|[4-9]|1[08])$/)) {
        (obj.code == 1 && data.length == $li.length) || setting.none || setting.lose++;
        state == setting.lose && $li.each(function(index, dom) {
            data[index] = (obj.code == 1 && data[index]) || '不会';
            dom = $(this).find('.inp').filter(':visible').val(data[index]).end().is(':hidden') ? $(this).next() : dom;
            $(dom).find('.edui-default + textarea').each(function() {
                UE.getEditor($(this).attr('name')).setContent(data[index]);
            });
        });
    } else {
        setting.none || setting.lose++;
    }
    return state == setting.lose;
}

function saveThis() {
    if (!setting.auto) return setTimeout(saveThis, setting.time);
    _self.alert = console.log;
    $('#tempsave').click();
    getIframe(0).parent().addClass('ans-job-finished');
}

function submitThis() {
    if (!setting.auto) {
    } else if (!$('.Btn_blue_1:visible').length) {
        getIframe(0).parent().addClass('ans-job-finished');
    } else if ($('#validate:visible', top.document).length) {
    } else if ($('#confirmSubWin:visible').length) {
        var $btn = $('#tipContent + * > a'),
        position = $btn.offset(),
        mouse = document.createEvent('MouseEvents');
        position = [position.left + Math.floor(46 * Math.random() + 1), position.top + Math.floor(26 * Math.random() + 1)];
        mouse.initMouseEvent('click', true, true, document.defaultView, 0, 0, 0, position[0], position[1], false, false, false, false, 0, null);
        _self.event = $.extend(true, {}, mouse);
        delete _self.event.isTrusted;
        _self.form1submit();
    } else {
        $('.Btn_blue_1')[0].click();
    }
    setTimeout(submitThis, Math.ceil(setting.time * Math.random()) * 2);
}

function checkToNext() {
    var $tip = $('.ans-job-icon', document);
    $tip = setting.check ? $tip : $tip.nextAll(setting.job).prevAll('.ans-job-icon');
    setInterval(function() {
        $tip.parent(':not(.ans-job-finished)').length || setting.jump && toNext();
    }, setting.time);
}

function toNext() {
    var $cur = $('#cur' + $('#chapterIdid').val()),
    $tip = $('span.currents ~ span');
    if ($cur.has('.blue').length || !$tip.length) {
        $tip = $('.roundpointStudent, .roundpoint').parent();
        var index = $tip.index($cur);
        $tip.slice(index + 1).not(':has(.lock, .blue)').find('span:last').eq(0).click().length || setting.course && switchCourse();
    } else {
        $tip.eq(0).click();
    }
}

function switchCourse() {
    GM_xmlhttpRequest({
        method: 'GET',
        url: '/visit/courses/study?isAjax=true&fileId=0&debug=',
        headers: {
            'Referer': location.origin + '/visit/courses',
            'X-Requested-With': 'XMLHttpRequest'
        },
        onload: function(xhr) {
            var list = $(xhr.responseText).find('li[style] a:has(img)').map(function() {
                return $(this).attr('href');
            }),
            index = list.map(function(index) {
                return this.match(top.courseId) && index;
            }).filter(function() {
                return $.isNumeric(this);
            })[0] + 1 || 0;
            setting.course = list[index] ? $.globalEval('location.replace("' + list[index] + '")') : 0;
        }
    });
}

function goCourse() {
    var jump = setting.course && document.referrer.match(/\/knowledge\/cards|\/mycourse\/studentstudy/);
    jump && setTimeout(function() {
        ($('.articlename a[href]:not([class])')[0] || $()).click();
    }, setting.time);
}

function autoRead() {
    if (!/^\d+(\.\d+)?$/.test(setting.goal)) return;
    var time = setting.goal * 60 / $('.course_section').length;
    $('html, body').animate({
        scrollTop: $(document).height() - $(window).height()
    }, Math.round(time) * 1E3, function() {
        $('.nodeItem.r i').click();
    }).one('click', '#top', function(event) {
        $(event.delegateTarget).stop();
    });
}

function DisplayURL() {
    $('.zmodel').on('click', '[onclick^=openFaceTip]', function() {
        _self.WAY.box.hide();
        var $li = $(this).closest('li');
        $.get('/visit/goToCourseByFace', {
            courseId: $li.find('input[name=courseId]').val(),
            clazzId: $li.find('input[name=classId]').val()
        }, function(data) {
            $li.find('[onclick^=openFaceTip]').removeAttr('onclick').attr({
                href: $(data).filter('script:last').text().match(/n\("(.+?)"/)[1],
                target: '_blank'
            });
            alert('本课程已临时解除面部识别');
        }, 'html');
    });
}

function getSchoolId() {
    $.getJSON('/org/searchUnis?filter=' + encodeURI(setting.school) + '&product=44', function(data) {
        if (!data.result) return alert('学校查询错误');
        var msg = $.grep(data.froms, function(value) {
            return value.name == setting.school;
        })[0];
        msg ? setTimeout(toLogin, setting.time, msg.schoolid) : alert('学校名称不完整');
    });
}

function toLogin(fid) {
    GM_xmlhttpRequest({
        method: 'GET',
        url: '/api/login?name=' + setting.username + '&pwd=' + setting.password + '&schoolid=' + fid + '&verify=0',
        onload: function(xhr) {
            var obj = $.parseJSON(xhr.responseText) || {};
            obj.result ? location.href = decodeURIComponent($('#ref, #refer_0x001').val()) : alert(obj.errorMsg || 'Error');
        }
    });
}

function submitAnswer($job, data) {
    $job.removeClass('ans-job-finished');
    data = $.grep($.map(data, function(value, index) {
        var $TiMu = $('.TiMu').eq(index);
        if (!$.isPlainObject(value) || !(value.type.match(/^[0-3]$/) && $TiMu.find('.fr').length)) {
            return false;
        } else if (value.type == '2') {
            var $ans = $TiMu.find('.Py_tk, .Py_answer').eq(0);
            if (!$TiMu.find('.cuo').length && value.code) {
                return false;
            } else if (!$ans.find('.cuo').length) {
                value.option = $ans.find('.clearfix').map(function() {
                    return $(this).text().trim();
                }).get().join('#') || '无';
            } else if (value.code) {
                value.code = -1;
            } else {
                return false;
            }
        } else if (value.type == '3') {
            var ans = $TiMu.find('.font20:last').text();
            if ($TiMu.find('.cuo').length) {
                value.option = {'√': '错误', '×': '正确'}[ans] || '无';
            } else if (!value.code) {
                value.option = {'√': '正确', '×': '错误'}[ans] || '无';
            } else {
                return false;
            }
        } else {
            var text = $TiMu.find('.Py_answer > span:first').text();
            if ($TiMu.find('.dui').length && value.code && !/^[A]?[B]?[C]?[D]?[E]?[F]?[G]?$/.test(value.option)) {
                return false;
            } else if ($TiMu.find('.dui').length || text.match('正确答案')) {
                value.option = $.map(text.match(/[A-G]/gi) || [], function(value) {
                    return filterImg($TiMu.find('.fl:contains(' + value + ') + a'));
                }).join('#') || '无';
            } else if (value.code) {
                value.code = -1;
            } else {
                return false;
            }
        }
        return value;
    }), function(value) {
        return value;
    });
    data.length && GM_xmlhttpRequest({
        method: 'POST',
        url: 'http://mooc.forestpolice.org/upload/cx/' + (setting.token || 0),
        headers: {
            'Content-type': 'application/x-www-form-urlencoded'
        },
        data: 'data=' + encodeURIComponent(parent.Ext.encode(data))
    });
    $job.addClass('ans-job-finished');
}

function filterImg(dom) {
    return $(dom).clone().find('img[src]').replaceWith(function() {
        return $('<p></p>').text('<img src="' + $(this).attr('src') + '">');
    }).end().text().trim();
}
