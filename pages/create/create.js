// pages/create/create.js
const url = 'https://weapp.fmcat.top'
const util = require('../../utils/util')
const app = getApp()

Array.prototype.remove = function(index) {
    this.splice(index, 1);
};
Page({
    data: {
        title: '',
        img: [],
        imgId: [],
        viewImg: [],
        jindu: [],
        goodEdit: false,
        goods: [],
        goodItem: {
            Name: '',
            Price: '',
            Count: ''
        },
        editIndex: -1,
        region: false,
        regionname: [],
        password: {
            adminpwd: '',
            managepwd: ''
        },
        hideprice: false,
        headshowtype: 1,
        endTime: '',
        endDate: '',
        info: [],
        moreOpen: false,
        popOpen: false,
        closeIng: false,
        vip: false,
        headshowmode: ['公开', '接龙者自选', '匿名隐藏'],
        headSelect: 0,
        startTime: '',
        inputPopOpen: false,
        popInputValue: '',
        isNull: false
    },
    onLoad: function(options) {
        let time = util.dateFormat(new Date(), 'YYYY-MM-DD')
        this.setData({
            startTime: time
        })
        app.create = () => {
            console.log(wx.getStorageSync('sessionId'));
        }
    },
    upImage() {
        let that = this;
        //上传图片部分代码
        let upImage = (img) => {
                let index = that.data.viewImg.indexOf(img)
                let uploadTask = wx.uploadFile({
                        url: url + '/order/uploadimg', //仅为示例，非真实的接口地址
                        filePath: img,
                        name: 'file',
                        formData: {
                            sessionId: wx.getStorageSync('sessionId')
                        },
                        success: function(res) {
                            let result = JSON.parse(res.data).result
                            console.log(res)
                            let img = that.data.img
                            let imgId = that.data.imgId
                            that.setData({
                                img: [...img, result.origin],
                                imgId: [...imgId, result.imgid]
                            })
                        },
                        fail: res => {
                            console.log(res)
                        }
                    })
                    //监听上传进度并改变
                uploadTask.onProgressUpdate((res) => {
                    let jindu = that.data.jindu
                    if (res.progress == 100) {
                        jindu[index] = 0
                    } else {
                        jindu[index] = res.progress
                    }
                    that.setData({
                        jindu: jindu
                    })
                })
            }
            //选择图片并调用上传接口
        wx.chooseImage({
            count: 5 - that.data.img.length, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function(res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                let tempFilePaths = res.tempFilePaths
                let count = tempFilePaths.length
                let img = that.data.viewImg
                let jindu = that.data.jindu
                for (let i = 0; i < count; i++) {
                    jindu.push(0)
                }
                that.setData({
                    viewImg: [...img, ...tempFilePaths],
                    jindu: jindu
                })
                tempFilePaths.forEach(function(item) {
                    upImage(item)
                }, this);
            }
        })
    },
    //预览图片
    viewImage(e) {
        let current = e.currentTarget.dataset.src
        wx.previewImage({
            current: current, // 当前显示图片的http链接
            urls: this.data.img
        })
    },
    //删除图片
    delImage(e) {
        let index = e.currentTarget.dataset.index
        let img = this.data.img
        let jindu = this.data.jindu
        let viewImg = this.data.viewImg
        img.remove(index)
        jindu.remove(index)
        viewImg.remove(index)
        this.setData({
            img,
            jindu,
            viewImg
        })
    },
    //添加商品
    addGood(e) {
        let goodinfo = this.data.goodItem
        let goods = this.data.goods
        let editIndex = this.data.editIndex
        if (goodinfo.Name.length === 0) {
            util.showModel('提示', '请填写商品名称！')
            return false
        }
        if (goodinfo.Price.length === 0) {
            util.showModel('提示', '请填写商品单价！')
            return false
        }
        if (editIndex === -1) {
            goods = [...goods, goodinfo]
        } else {
            goods[editIndex] = goodinfo
        }
        this.setData({
            goods,
            goodEdit: false,
            goodItem: {
                Name: '',
                Price: '',
                Count: ''
            },
            editIndex: -1
        })
    },
    //设置input绑定
    setGoodValue(e) {
        let goodItem = this.data.goodItem
        let param = e.currentTarget.dataset.param
        goodItem[param] = e.detail.value
        this.setData({
            goodItem
        })
    },
    //新建一个商品
    createNewGood() {
        this.setData({
            goodEdit: true
        })
    },
    //编辑已添加的商品
    editGood(e) {
        let index = e.currentTarget.dataset.index
        let goods = this.data.goods
        let goodItem = goods[index]
        this.setData({
            goodItem,
            goodEdit: true,
            editIndex: index
        })
    },
    //删除已添加的商品
    deleteGood(e) {
        let index = e.currentTarget.dataset.index
        let goods = this.data.goods
        goods.remove(index)
        this.setData({
            goods
        })
    },
    //设置主题文本框值
    setTitleValue(e) {
        this.setData({
            title: e.detail.value
        })
    },
    //获取复选框值
    checkboxChange(e) {
        this.setData({
            info: e.detail.value
        })
    },
    //检测是否vip，打开弹窗或者更多选项
    openMoreOpation() {
        let that = this;
        if (this.data.moreOpen) {
            return
        }
        if (!this.data.vip) {
            wx.request({
                url: url + '/Order/IsVIP',
                data: {
                    sessionId: wx.getStorageSync('sessionId')
                },
                success: function(res) {
                    console.log(res);
                    if (res.data.result.vip) {
                        that.setData({
                            moreOpen: true,
                            vip: true
                        })
                    } else {
                        that.setData({
                            popOpen: true
                        })
                    }
                }
            })
        } else {
            that.setData({
                moreOpen: true
            })
        }
    },
    //弹窗关闭
    closePop() {
        let that = this
        that.setData({
            closeIng: true
        })
        setTimeout(function() {
            that.setData({
                closeIng: false,
                popOpen: false
            })
        }, 300);
    },
    //绑定头像显示模式选择
    bindPickerChange(e) {
        this.setData({
            headSelect: e.detail.value
        })
    },
    //绑定日期选择值
    bindDateChange(e) {
        this.setData({
            endDate: e.detail.value
        })
    },
    //判断选择时间是否比当前时间小
    bindTimeChange(e) {
        let nowTime = Date.parse(new Date());
        let selectTime = Date.parse(new Date(this.data.endDate + ' ' + e.detail.value));
        if (selectTime < nowTime) {
            util.showModel('提示', '截止时间不能小于当前时间！')
            return false
        } else {
            this.setData({
                endTime: e.detail.value
            })
        }
    },
    //绑定密码值
    setPassword(e) {
        let param = e.currentTarget.dataset.param
        let password = this.data.password
        password[param] = e.detail.value
        this.setData({
            password
        })
    },
    //设置隐藏单价
    setHidePrice(e) {
        this.setData({
            hideprice: e.detail.value
        })
    },
    //设置地区
    setRegion(e) {
        this.setData({
            region: e.detail.value
        })
    },
    //弹窗文本框值绑定
    popInput(e) {
        this.setData({
            popInputValue: e.detail.value
        })
    },
    //弹窗取消按钮
    popCancel() {
        let that = this
        this.setData({
            popInputValue: '',
            closeIng: true
        })
        setTimeout(function() {
            that.setData({
                closeIng: false,
                inputPopOpen: false
            })
        }, 300);
    },
    //弹窗确定添加新地区
    popConfirm() {
        let regionname = this.data.regionname
        let that = this
        if (that.data.popInputValue != '') {
            regionname.push(that.data.popInputValue)
            that.setData({
                regionname
            })
            that.popCancel()
        } else {
            that.setData({
                isNull: true
            })
            setTimeout(function() {
                that.setData({
                    isNull: false
                })
            }, 500);
        }
    },
    //打开输入框添加地区
    createNewRegion() {
        this.setData({
            inputPopOpen: true
        })
    },
    //删除一个地区
    deleteRegion(e) {
        let that = this
        let index = e.currentTarget.dataset.index
        let regionname = that.data.regionname
        regionname.remove(index)
        this.setData({
            regionname
        })
    },
    //提交发布接龙
    createSubmit(e) {
        let that = this
        let d = that.data
        let info = d.info
        let post = {
            title: d.title,
            imgs: d.imgId,
            goods: JSON.stringify(d.goods),
            endtime: d.endDate + ' ' + d.endTime,
            region: d.region,
            regionnames: d.regionname.join(','),
            adminpwd: d.password.adminpwd,
            managepwd: d.password.managepwd,
            hideprice: d.hideprice,
            headshowtype: parseInt(d.headSelect) + 1,
            phone: false,
            realname: false,
            weixin: false,
            sessionId: wx.getStorageSync('sessionId')
        }
        if (info.length != 0) {
            info.forEach((item) => {
                post[item] = true
            })
        }
        if (post.title.length == 0) {
            util.showModel('提示', '请填写标题')
            return false
        }
        if (that.checkTime(post.endtime)) {
            util.showModel('提示', '截止时间不能小于当前时间！')
            return false
        }
        if (post.goods.length == 0) {
            util.showModel('提示', '最少添加一件商品')
            return false
        }
        if (post.region) {
            if (post.regionnames.length === 0) {
                util.showModel('提示', '最少添加一地区')
                return false
            }
        }
        wx.request({
            url: url + '/Order/AddOrder',
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            data: post,
            success: function(res) {
                console.log(res);
                if (res.data.ok === 1) {
                    util.showSuccess('发布成功！')
                    setTimeout(function() {
                        wx.navigateTo({
                            url: '../index/index'
                        })
                    }, 1000);
                }
            }
        })
    },
    //检查时间
    checkTime(date) {
        let now = Date.parse(new Date())
        let select = Date.parse(new Date(date))
        console.log(now.select);
        if (select > now) {
            return false
        } else {
            return true
        }
    }
})