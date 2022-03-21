// pages/detail/detail.js

const app = getApp();
const api = require('../../config/config.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        commentList: [],        // 评论列表
        bookInfo: {},           // 书籍信息
        bookIsBuy: -1,          // 是否已购买
        commentLoading: true,   // 评论loading态
        downloading: false,     // 是否正在下载
        downloadPercent: 0      // 当前书籍下载百分比
    },


    goComment: function(ev) {
        // 获取dataset
        let info = ev.currentTarget.dataset;
        // console.log(info);
        // console.log(ev.currentTarget);
        let navigateUrl = '../comment/comment?';

        for (let key in info) {
            info[key] = encodeURIComponent(info[key]);
            navigateUrl += key + '=' + info[key] + '&';
        }

        navigateUrl = navigateUrl.substring(0, navigateUrl.length - 1);

        wx.navigateTo({
            url: navigateUrl
        });
    },

    readBook: function() {
        let that = this;
        let fileUrl = that.data.bookInfo.file;
        let key = 'book_' + that.data.bookInfo.id;
        // 书籍是否已下载过
        let downloadPath = app.getDownloadPath(key);
        // console.log(downloadPath);
        // console.log(fileUrl);
        // console.log(key);
        if (downloadPath) {
            app.openBook(downloadPath);
            return;
        }

        const downloadTask = wx.downloadFile({
            url: fileUrl,
            success: function(res) {
                let filePath = res.tempFilePath
                that.setData({
                    downloading: false
                });

                // 调用 wx.saveFile 将下载的文件保存在本地
                app.saveDownloadPath(key, filePath)
                    .then(function(saveFilePath) {
                        app.openBook(saveFilePath);
                    })
                    .catch(function() {
                        app.showInfo('文件保存失败');
                    });

            },
            fail: function(error) {
                that.showInfo('文档下载失败:'+error);
                console.log(error);
            }
        });

        downloadTask.onProgressUpdate(function(res) {
            that.setData({
                downloading: true,
                downloadPercent: res.progress
            });
        });
    },


    confirmBuyBook: function() {
        let that = this;
        let book = that.data.bookInfo;
        wx.showModal({
            title: '提示',
            content: '确定用'+book.price+'积分兑换此书吗？',
            showCancel: true,
            cancelText: '打扰了',
            cancelColor: '#8a8a8a',
            confirmText: '确定',
            confirmColor: '#1AAD19',
            success: function(res) {
                if (res.confirm) {
                    // 兑换
                    that.buyBook();

                } else if (res.cancel) {
                    // 取消
                }
            }
        });
    },
    // 兑换书籍
    buyBook: function() {
        let that = this;
        let book = that.data.bookInfo;
        console.log(book);
        let requestData = {
            bkId: book.id,
            uid: app.getLoginFlag(),
            bkFile: book.file,
            bkName: book.name,
            bkCover: book.image,
            price: book.price
        };
        let balance = app.globalData.userInfo.balance;
        if(balance - book.price < 0){
            that.showInfo('剩余积分：'+balance+'不足，无法兑换价格：'+book.price+'的书籍');
            return;
        }

        wx.request({
            url: api.buyBookUrl,
            method: 'POST',
            data: requestData,
            success: function(res) {
                res = res.data
                if (res.code === 1000) {
                    // 将按钮置为“打开”
                    // 更新用户兑换币的值
                    that.setData({
                        bookIsBuy: 1
                    });

                    app.globalData.userInfo.balance = balance - book.price;
                    wx.setStorageSync('userInfo', JSON.stringify(app.globalData.userInfo));

                    that.showInfo('购买成功', 'success');

                } else {
                    console.log(res);
                    that.showInfo('返回数据异常');
                }
            },
            fail: function(error) {
                console.log(error);
                that.showInfo('请求失败');
            }
        });

    },

    // 获取书籍评论列表及是否购买
    getPageData: function() {

        let that = this;
        let book = that.data.bookInfo;
        let requestData = {
            bkId: book.id,
            uid: app.getLoginFlag()
        };

        wx.request({
            url: api.queryBookUrl,
            method:'POST',
            data: requestData,
            success: function(res) {
                // console.log(requestData);
                res = res.data;
                // console.log(res);
                let data = res.data;
                if (res.code === 1000) {
                    that.setData({
                        commentList: data.comments || [],
                        bookIsBuy: data.isBuy
                    });

                    setTimeout(function() {
                        that.setData({
                            commentLoading: false
                        });
                    }, 500);
                } else {
                    that.showInfo('返回数据异常');
                }
            },
            fail: function(error) {
                that.showInfo('请求失败');
            }
        });
    },


    showInfo: function(info, icon = 'none') {
        wx.showToast({
            title: info,
            icon: icon,
            duration: 1500,
            mask: true
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let _bookInfo = {};
        let that = this;

        for (let key in options) {
            _bookInfo[key] = decodeURIComponent(options[key]);
        }

        that.setData({
            bookInfo: _bookInfo
        });

        that.getPageData();


    },

    // 从上级页面返回时 重新拉去评论列表
    backRefreshPage: function() {

        let that = this;
        that.setData({
            commentLoading: true
        });

        that.getPageData();

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        if (wx.getStorageSync('isFromBack')) {
            wx.removeStorageSync('isFromBack')
            this.backRefreshPage();
        }
    }
});