// pages/comment/comment.js

const app = getApp();
const api = require('../../config/config.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        bookInfo: {},
        comment: ''
    },

    // 用户输入评论
    inputComment: function(ev) {
        let that = this;
        that.setData({
            comment: ev.detail.value
        });
    },

    checkEmpty: function(input) {
        return input === '';
    },

    // 检查用户是否输入了非法字符
    checkIllegal: function(input) {
        let patern = /[`#^<>:"?{}\/;'[\]]/im;
        let _result = patern.test(input);
        return _result;
    },

    checkUserInput: function() {
        /*
         * 检测用户输入
         * 1. 是否包含非法字符
         * 2. 是否为空
         * 3. 是否超出长度限制
         */
        let that = this;
        let comment = that.data.comment;
        let showToastFlag = false;
        let toastWording = '';

        if (that.checkEmpty(comment)) {
            showToastFlag = true;
            toastWording = '输入不能为空';
        } else if (that.checkIllegal(comment)) {
            showToastFlag = true;
            toastWording = '含有非法字符';
        } else if (comment.length > 140) {
            showToastFlag = true;
            toastWording = '长度超出限制';
        }

        if (showToastFlag) {
            that.showInfo(toastWording);
            return false;
        } else {
            return true;
        }
    },

    submitComment: function(ev) {
        let that = this;
        // console.log(ev.detail);
        if (that.checkUserInput()) {
            // console.log('submit!');
            let userInfo = app.globalData.userInfo;

            let requestData = {
                uid: app.getLoginFlag(),
                author: userInfo.nickName,
                content: that.data.comment,
                bkId: that.data.bookInfo.id,
                pid: 0
            };

            // console.log(requestData);
            wx.request({
                url: api.commentUrl,
                method: 'POST',
                data: requestData,
                success: function(res) {
                    res = res.data;
                    // console.log(res);
                    if (res.code == 1000) {
                        that.showInfo('评论成功', 'success', function() {
                            wx.setStorageSync('isFromBack', '1');
                            setTimeout(function() {
                                wx.navigateBack({
                                    delta: 1
                                });
                            }, 1500);
                        });
                    } else {
                        console.log(res);
                        that.showInfo(res.msg);
                    }

                },
                fail: function(error) {
                    that.showInfo('请求失败');
                }
            });
        }
    },


    // 封装 wx.showToast
    showInfo: function(info, icon = 'none', callback = () => {}) {
        wx.showToast({
            title: info,
            icon: icon,
            duration: 1500,
            mask: true,
            success: callback
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let _bookInfo = {};
        // console.log(options);
        for (let key in options) {
            _bookInfo[key] = decodeURIComponent(options[key]);
        }
        console.log(_bookInfo);
        this.setData({
            bookInfo: _bookInfo
        });
    },


    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    }
});