// pages/create/create.js
const url = 'https://weapp.fmcat.top'
const util = require('../../utils/util')
Array.prototype.remove = function (index) {
    this.splice(index, 1);
};
Page({
    data: {
        title: '',
        img: [],
        viewImg: [],
        jindu: [],
        goodEdit: false,
        goods: [{
            Name: '火鸡(500g为一件)',
            Price: '56.00',
            Count: '100'
        }],
        goodItem: {
            Name: '',
            Price: '',
            Count: ''
        },
        editIndex: -1,
        region: false,
        regionname: '',
        adminpwd: '',
        managepwd: '',
        hideprice: false,
        headshowtype: 1,
        endTime: '',
        info: []
    },
    onLoad: function (options) {

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
                success: function (res) {
                    let result = JSON.parse(res.data).result
                    console.log(res)
                    let img = that.data.img
                    that.setData({
                        img: [...img, result.origin]
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
            success: function (res) {
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
                tempFilePaths.forEach(function (item) {
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
    setTitleValue(e) {
        this.setData({
            title: e.detail.value
        })
    },
    checkboxChange(e) {
        this.setData({
            info:e.detail.value
        })
    }
})