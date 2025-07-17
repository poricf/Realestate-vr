var swiper, layer, layerform = null, isSwiperLoading = false, isVrFirstloading = false, isAutoRotate = true;
layui.use(function () {
    layer = layui.layer;
    layerform = layui.form;
});

window.onload = function () {
    template.defaults.minimize = true;
    if (groupMode == 0) {
        loadingItemSceneListHtml(visitItemSceneList[0]);
    } else {
        loadingItemSceneListHtml(visitItemSceneList[groupModeFirstId]);
        $('.itemGroupListContainer .itemGroupList .groupName' + groupModeFirstId).addClass('active').siblings('div').removeClass('active');
    }
    isSwiperLoading = true;
    if ($('.marqueeTop').length > 0) {
        $('.marqueeContent').liMarquee();
        setTimeout(function () {
            $('.marqueeTop').show();
        }, 300);
    }
    $('.itemSwiper .swiper-wrapper .swiper-slide:eq(0)').children('.swiper-box').addClass('active').children('img').show();
    addScrollAnimationStyle();
    autoClipboard();
    /**移动端不展示部分内容**/
    if (isMobile()) {
        $('.iconBottomRight .share').hide();
        $('.iconRight .gyro').show();
        $('.gestureTips div').html('<img src="skin/img/touch_alert.png"><span>Drag the mouse to browse</span>');
        if ($('.itemGroupListContainer').length == 0) {
            $('.itemPreview').css('bottom', '55px');
        }
    } else {
        $('.iconBottomRight .share').show();
        $('.iconRight .gyro').hide();
        $('.gestureTips div').html('<img src="skin/img/mouse_alert.png"><span>Finger drag screen browsing</span>');
        if ($('.itemGroupListContainer').length == 0) {
            $('.itemPreview').css('bottom', '90px');
        }
    }
    if (visitPwdOpen == 2) {
        lockFullScreen();
    } else {
        onloadCompalteInit();
    }
    if (isFirstSceneCompareMode > 0) {
        $('.iconRight .openCompare').show();
        $('.iconRight .openCompare').click();
    }
}

/**初次加载后执行**/
function onloadCompalteInit() {
    krpano.events.addListener('onloadcomplete', function () {
        if (!isVrFirstloading) {
            if ($('.marqueeTop').length > 0) {
                $('.marqueeContent').liMarquee();
                setTimeout(function () {
                    $('.marqueeTop').show();
                }, 300);
            }
            setTimeout(function () {
                $('.gestureTips').show();
            }, 1000);
            setTimeout(function () {
                $('.gestureTips').hide();
            }, 4000);
            isVrFirstloading = true;
        }
    });
    if (krpano.get('autorotate.enabled') === false) {
        isAutoRotate = false;
    }
}

/**退出全屏对比模式**/
$('.exitCompare div').on('click', function () {
    $('#pano').show();
    $('#panoCompare').hide();
    $('.exitCompare div').hide();
    if (krpanoCompare != null) {
        removepano('panoCompare');
        krpanoCompare = null;
    }
});
/**开启全屏对比模式**/
$('.openCompare').on('click', function () {
    $('#pano').hide();
    $('#panoCompare').show();
    $('.exitCompare div').show();
    let _id = panoFirstCompareInfo.id;
    if (panoSceneNums > 1) {
        _id = $('.itemPreviewContainer .itemPreview .swiper-slide-active').attr('data-id');
    }
	let _xml = "compare" + _id + '.xml';
    if (krpanoCompare != null) {
        removepano('panoCompare');
    }
    embedpano({
        id: "krpanoCompareObject", xml: _xml, target: "panoCompare", onready: function (k) {
            krpanoCompare = k;
        }
    });
});

window.onresize = function () {
    if (isSwiperLoading) {
        loadingSwiperPlugin();
    }
}

/**加载swiper插件**/
function loadingSwiperGroupPlugin() {
    let _clienWidth = document.body.clientWidth;
    new Swiper(".groupSwiper", {
        slidesPerView: 'auto',
        spaceBetween: 10,
        breakpoints: {
            320: {
                slidesPerView: parseInt(_clienWidth / 75),
                spaceBetween: 10
            },
            768: {
                slidesPerView: parseInt(_clienWidth / 85),
                spaceBetween: 10
            },
            1280: {
                slidesPerView: parseInt(_clienWidth / 95),
                spaceBetween: 10
            }
        },
        grabCursor: true,
        on: {
            init: function () {
                let _slideWidth = $('.itemSwiper .swiper-slide').css("width");
                $('.groupSwiper .swiper-slide').css({"width": (parseInt(_slideWidth) + 10) + 'px'});
            },
            resize: function () {
            },
        },
        centerInsufficientSlides: true,
        freeMode: true,
    });
}

/**加载swiper插件**/
function loadingSwiperPlugin() {
    let _clienWidth = document.body.clientWidth;
    swiper = new Swiper(".itemSwiper", {
        slidesPerView: 'auto',
        spaceBetween: 10,
        breakpoints: {
            320: {
                slidesPerView: parseInt(_clienWidth / 75),
                spaceBetween: 10
            },
            768: {
                slidesPerView: parseInt(_clienWidth / 85),
                spaceBetween: 10
            },
            1280: {
                slidesPerView: parseInt(_clienWidth / 95),
                spaceBetween: 10
            }
        },
        grabCursor: true,
        on: {
            init: function () {
                let _slideWidth = $('.itemSwiper .swiper-slide').css("width");
                $('.itemSwiper .swiper-slide .swiper-box').css({"width": (parseInt(_slideWidth) - 4) + 'px', "height": (parseInt(_slideWidth) - 4) + 'px'});
                showSceneThumbHandler();
            },
            resize: function () {
            },
        },
        centerInsufficientSlides: true,
        freeMode: true,
    });
    loadingSwiperGroupPlugin();
}

/**重载场景列表数据**/
function loadingItemSceneListHtml(data) {
    $('.itemSwiper .swiper-wrapper').html(template('itemSlideTpl', data));
    loadingSwiperPlugin();
}

/**点击分组加载数据**/
$(document).on('click', '.itemGroupList .groupName', function () {
    $(this).addClass('active').siblings('div').removeClass('active');
    let _index = $(this).attr('data-id');
    loadingItemSceneListHtml(visitItemSceneList[_index]);
    $('.itemSwiper .swiper-wrapper .swiper-slide:eq(0)').click();
});

/**点击场景**/
$(document).on('click', '.itemSwiper .swiper-wrapper .swiper-slide', function () {
    let _id = $(this).attr('data-id');
    let _compareId = $(this).attr('data-compare');
    $(this).children('.swiper-box').addClass('active').parent().siblings().children('.swiper-box').removeClass('active');
    $(this).children('.swiper-box').children('img').show();
    swiper.slideTo($(this).index(), 1000, false);
    if (_compareId > 0) {
        $('.exitCompare div').click();
        $('.iconRight .openCompare').show();
        $('.iconRight .openCompare').click();
        krpano.call('loadscene(scene_' + _id + ', null, MERGE, BLEND(1.0));scene3dtransition(scene_' + _id + ');');
    } else {
        $('.iconRight .openCompare').hide();
        $('.exitCompare div').click();
        krpano.call('loadscene(scene_' + _id + ', null, MERGE, BLEND(1.0));scene3dtransition(scene_' + _id + ');');
    }
    clickSceneThumbTmpHandler(_id);
});

/**点击展示场景选择**/
var _fristClickScene = false;
$(document).on('click', '.iconBottomLeft .scene', function () {
    if (!_fristClickScene && !$('.itemPreviewContainer').is(":visible")) {
        setTimeout(function () {
            loadingSwiperPlugin();
            $('.itemPreviewContainer .itemPreview').css('z-index', 50);
            $('.itemGroupListContainer').show();
        }, 500);
    } else {
        $('.itemGroupListContainer').toggle();
    }
    $('.itemPreviewContainer').toggle();
    _fristClickScene = true;
});

/**点赞**/
$(document).on('click', '.iconBottomRight .like', function () {
    let _that = $(this);
    let _zanNum = parseInt(_that.children('span').text());
    if (_that.hasClass('-ok')) {
        layer.msg('succeed!');
        return false;
    }
    $.ajax({
        type: "POST",
        url: VRURL + "addlike",
        data: {
            visitid: visitId,
        },
    }).done(function (data) {
        layer.msg(data.msg, {time: 1000}, function () {
            if (data.status == 200) {
                _that.addClass('-ok').children('span').text(_zanNum + 1);
                _that.children('img').attr('src', _that.attr('data-img'));
            }
        });
    });
});

/**当前环境是否是手机**/
function isMobile() {
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    }
}

/**作品简介 弹窗**/
$(document).on('click', '.iconBottomRight .infos', function () {
    let _area = ['450px', '350px'];
    if (isMobile()) {
        _area = ['90%', '400px'];
    }
    layer.open({
        type: 1,
        title: 'Work information',
        shadeClose: false,
        shade: 0.8,
        area: _area,
        content: $('.infosContainer')
    });
});

/**在线预约 弹窗**/
$(document).on('click', '.iconBottomRight .yuyue', function () {
    let _area = ['500px', '400px'];
    if (isMobile()) {
        _area = ['90%', '400px'];
    }
    layer.open({
        type: 1,
        title: 'ONLINE',
        shadeClose: false,
        shade: 0.8,
        area: _area,
        content: $('.yuyueContainer')
    });
});

/**在线预约 提交**/
function addItemYuyue() {
    let _username = $('#username').val();
    let _userphone = $('#userphone').val();
    let _userinfos = $('#userinfos').val();
    if (_username == '') {
        layer.msg('Please enter your name');
        return false;
    }
    if (_userphone == '') {
        layer.msg('Please enter your phone number');
        return false;
    }
    if (_userinfos == '') {
        layer.msg('Briefly describe your needs');
        return false;
    }
    $.ajax({
        type: "POST",
        url: VRURL + "addyuyue",
        data: {
            visitid: visitId,
            username: _username,
            userphone: _userphone,
            userinfos: _userinfos,
        },
    }).done(function (data) {
        layer.msg(data.msg, {time: 1000}, function () {
            if (data.status == 200) {
                $('#username').val("");
                $('#userphone').val("");
                $('#userinfos').val("");
                layer.closeAll();
            }
        });
    });
}

/**联系方式 弹窗**/
$(document).on('click', '.iconBottomRight .contacts', function () {
    let _area = ['260px', '260px'];
    if (isMobile()) {
        _area = ['90%', '260px'];
    }
    layer.open({
        type: 1,
        title: 'Contact information',
        shadeClose: false,
        shade: 0.8,
        area: _area,
        content: $('.contactsContainer')
    });
});

/**复制插件**/
function autoClipboard() {
    let clipboard = new ClipboardJS('.clipboard');
    clipboard.on('success', function (e) {
        if (e.text.length > 0) {
            layer.msg('succeed！', {time: 1000});
        }
    });
}

/**音乐播放状态切换**/
function soundOnPlay() {
    $('.iconRight .music img').attr('src', 'skin/img/music-open.png');
}

/**音乐暂停状态切换**/
function soundOnPause() {
    $('.iconRight .music img').attr('src', 'skin/img/music-close.png');
}

/**热点音频暂停**/
function hotspotAudioOnPlay(src) {
    var _src = $('#autoHotspotAudio').attr('src');
    if (_src === undefined || _src != src) {
        $('#autoHotspotAudio').attr('src', src);
        document.getElementById('autoHotspotAudio').play();
        krpano.call("pausesound('bgsnd')");
    } else {
        var _obj = document.getElementById('autoHotspotAudio');
        if (_obj.paused == false) {
            hotspotAudioOnPause();
            krpano.call("playsound('bgsnd')");
        } else {
            document.getElementById('autoHotspotAudio').play();
            krpano.call("pausesound('bgsnd')");
        }
    }
}

/**热点音频播放**/
function hotspotAudioOnPause() {
    document.getElementById('autoHotspotAudio').pause();
}

/**点击热点 跳转场景**/
function HotspotToScene(t) {
    loadingItemSceneListHtml(visitItemSceneList[scene2group[t]]);
    $('.itemSwiper .swiper-wrapper .swiper-slide' + t).click();
    $('.itemSwiper .swiper-wrapper .swiper-slide' + t).children('.swiper-box').children('img').show();
    $('.itemGroupListContainer .itemGroupList .groupName' + scene2group[t]).addClass('active').siblings('div').removeClass('active');
    clickSceneThumbTmpHandler(t);
}

/**点击热点 打开图片**/
function HotspotToPic(t) {
    let _arr = [];
    _arr['list'] = hotspotlistpics[t];
    $('.hotspotlistpics').html(template('glightBoxPicTpl', _arr));
    var lightboxPics = GLightbox({
        selector: '.glightboxpic',
    });
    lightboxPics.on('open', () => {
        if (isAutoRotate === true) {
            krpano.set("autorotate.enabled", false);
        }
    });
    lightboxPics.on('close', () => {
        if (isAutoRotate === true) {
            krpano.set("autorotate.enabled", true);
        }
    });
    lightboxPics.open();
    $('#glightbox-body .goverlay').css("background-color", "rgba(0, 0, 0, 0.8)");
    $('.glightbox-open').css("height", "100%");
}

/**点击热点 打开视频**/
function HotspotToVideo(t) {
    let _arr = [];
    _arr['list'] = hotspotlistvideo[t];
    $('.hotspotlistvideo').html(template('glightBoxVideoTpl', _arr));
    var lightboxVideo = GLightbox({
        selector: '.glightboxvideo',
    });
    lightboxVideo.on('open', () => {
        if (isAutoRotate === true) {
            krpano.set("autorotate.enabled", false);
        }
    });
    lightboxVideo.on('close', () => {
        if (isAutoRotate === true) {
            krpano.set("autorotate.enabled", true);
        }
    });
    lightboxVideo.open();
    $('#glightbox-body .goverlay').css("background-color", "rgba(0, 0, 0, 0.8)");
    $('.glightbox-open').css("height", "100%");
}

/**密码输入**/
function lockFullScreen() {
    layui.use(function () {
        layer = layui.layer;
        layerform = layui.form;
        layer.open({
            type: 1,
            title: false, // 禁用标题栏
            closeBtn: false, // 禁用默认关闭按钮
            area: ['100%', '100%'],
            scrollbar: false, // 暂时屏蔽浏览器滚动条
            anim: -1, // 禁用弹出动画
            isOutAnim: false, // 禁用关闭动画
            id: 'lockFullScreen',
            skin: 'skin-layer-lockFullScreen',
            content: ['<div class="layui-form">',
                '<div class="layui-input-wrap">',
                '<input type="password" maxlength="8" class="skin-layer-lockFullScreen-layer-pin" lay-affix="eye">',
                '<div class="layui-input-suffix">',
                '<i class="layui-icon layui-icon-right" id="lockFullScreen-unlock"></i>',
                '</div>',
                '</div>',
                '<div>Enter the correct password</div>',
                '</div>'].join(''),
            success: function (layero, index) {
                var input = layero.find('input');
                /**表单组件渲染**/
                layerform.render();
                input.focus();
                /**点击解锁按钮**/
                var elemUnlock = layero.find('#lockFullScreen-unlock');
                elemUnlock.on('click', function () {
                    let _pwd = $.trim(input[0].value);
                    $.ajax({
                        type: "GET",
                        url: VRURL + "checkitempwd",
                        data: {
                            visitid: visitId,
                            pwd: _pwd,
                        },
                    }).done(function (data) {
                        if (data.status == 200) {
                            layer.closeAll();
                            embedpano({
                                xml: visitXml, target: "pano", onready: function (k) {
                                    krpano = k;
                                    onloadCompalteInit();
                                }
                            });
                        } else if (data.status == -200) {
                            layer.msg('Too many password errors, try again in 10 minutes', {offset: '16px', anim: 'slideDown'})
                            input.focus();
                        } else {
                            layer.msg('Password error', {offset: '16px', anim: 'slideDown'})
                            input.focus();
                        }
                    });
                });
                /**回车**/
                input.on('keyup', function (e) {
                    var elem = this;
                    var keyCode = e.keyCode;
                    if (keyCode === 13) {
                        elemUnlock.trigger('click');
                    }
                });
            }
        });
    });
}

/**自动切换下一场景 赋予缩略图新的样式**/
function switchSceneThumb(id) {
    if (groupMode == 0) {
        $('.itemSwiper .swiper-slide' + id).children('.swiper-box').addClass('active').parent().siblings().children('.swiper-box').removeClass('active');
        $('.itemSwiper .swiper-slide' + id).children('.swiper-box').children('img').show();
        clickSceneThumbTmpHandler(id);
    } else {
        HotspotToScene(id);
    }
}

/**临时储存已经访问过的场景的id**/
function clickSceneThumbTmpHandler(t) {
    clickSceneThumbTmp.includes(t) === false ? clickSceneThumbTmp.push(t) : '';
    addScrollAnimationStyle();
}

/**增加滚动的样式**/
function addScrollAnimationStyle() {
    $("body,html").removeClass('scroll-animation');
    let _gText = $('.itemGroupListContainer .itemGroupList .active div span').text();
    let _iText = $('.itemPreviewContainer .itemPreview .swiper-wrapper .swiper-slide .active div span').text();
    if (_gText.length > 5) {
        $('.itemGroupListContainer .itemGroupList .active div span').addClass('scroll-animation');
    }
    if (_iText.length > 5) {
        $('.itemPreviewContainer .itemPreview .swiper-wrapper .swiper-slide .active div span').addClass('scroll-animation');
    }
}

/**赋予已经访问过的场景的缩略图选中状态**/
function showSceneThumbHandler() {
    $('.itemSwiper .swiper-slide').each(function (index, element) {
        let _id = $(this).attr('data-id');
        if (clickSceneThumbTmp.includes(_id) == true) {
            $(this).children('.swiper-box').children('img').show();
        }
    });
}

/**ai光影效果加载**/
function showEffectInformation(json_string) {
    var _s = JSON.parse(json_string);
    krpano.set("plugin[pp_light].exposure", _s.exposure);
    krpano.set("plugin[pp_light].lights", _s.lights);
    krpano.set("plugin[pp_light].shadows", _s.shadows);
    krpano.set("plugin[pp_light].filterrange", _s.filterrange);
    krpano.set("plugin[pp_light].masking", _s.masking);
    krpano.set("plugin[pp_sharpen].strength", _s.strength);
    krpano.set("plugin[pp_sharpen].range", _s.range);
    krpano.set("plugin[pp_blur].range", _s.blurrange);
}

/**切换陀螺仪**/
function switchGyro(obj) {
    krpano.call('copy(plugin[skin_gyro].url, plugin[skin_gyro].plugin_url);switch(plugin[skin_gyro].enabled);');
    let _opacity = $(obj).css('opacity');
    if (_opacity == 1) {
        $(obj).css('opacity', 0.5);
    } else {
        $(obj).css('opacity', 1);
    }
}

/**全屏设置**/
function jsfullScreen() {
    var isFull = !!(document.webkitIsFullScreen || document.mozFullScreen ||
        document.msFullscreenElement || document.fullscreenElement
    );
    if (isFull == false) {
        var element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
        $('.iconRight .fullscreen img').attr('src', 'skin/img/exitfullscreen.png');
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        $('.iconRight .fullscreen img').attr('src', 'skin/img/fullscreen.png');
    }
}

/**热点音频暂停**/
function hotspotAudioOnPlay(src) {
    var _src = $('#autoHotspotAudio').attr('src');
    if (_src === undefined || _src != src) {
        $('#autoHotspotAudio').attr('src', src);
        document.getElementById('autoHotspotAudio').play();
        krpano.call("pausesound('bgsnd')");
    } else {
        var _obj = document.getElementById('autoHotspotAudio');
        if (_obj.paused == false) {
            hotspotAudioOnPause();
            krpano.call("playsound('bgsnd')");
        } else {
            document.getElementById('autoHotspotAudio').play();
            krpano.call("pausesound('bgsnd')");
        }
    }
}

/**热点音频播放**/
function hotspotAudioOnPause() {
    document.getElementById('autoHotspotAudio').pause();
}

/***商品热点弹窗显示***/
function hotspotShop(id) {
    let _clas = "";
    let _area = ['570px', '210px'];
    if (isMobile()) {
        _area = ['90%', '300px'];
        _clas = "mobile-bottom";
    }
    let _shopinfo = JSON.parse(hotspotlistShop[id]);
    let _tplobj = {};
    _tplobj['list'] = [
        {
            "thumb": VRIMGURL + _shopinfo.thumb,
            "name": _shopinfo.name,
            "intro": _shopinfo.intro,
            "price": _shopinfo.price,
            "unit": _shopinfo.unit,
            "link": _shopinfo.link,
            "clas": _clas,
        },
    ];
    layer.open({
        type: 1,
        title: false,
        shadeClose: true,
        area: _area,
        content: template('edit-item-info-hotspot-shop-container-tpl', _tplobj),
    });
}

/**外部分享使用**/
function openKpShare(type) {
    var api;
    if (type == 1) {
        api = 'https://www.facebook.com/sharer/sharer.php?u={url}&t={title}&hashtags=keypano';
    } else {
        api = 'https://twitter.com/intent/tweet?text={content}&url={url}&related=&hashtags=keypano' + document.domain;
    }
    var ourl = api.replace('{url}', location.href).replace('{title}',
        $('#canvasName').val()).replace('{content}', $('#canvasContent').val()).replace('{pic}', $('#canvasThumbUrl').val());
    window.open(ourl, 'newwindow', 'height=600,width=900,top=60,left=40');
}