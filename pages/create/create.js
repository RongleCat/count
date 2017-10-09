// pages/create/create.js
const url = 'https://weapp.fmcat.top'
const util = require('../../utils/util')
Array.prototype.remove = function (index) {
    this.splice(index, 1);
};
Page({
    data: {
        img: [],
        viewImg: [],
        jindu: [],
        goodEdit:true,
        goods:[],
        goodItem:{
            Name:'',
            Price:'',
            Count:''
        }
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
                name: 'image',
                formData: {
                    sessionId: wx.getStorageSync('sessionId')
                },
                success: function (res) {
                    let result = JSON.parse(res.data).result
                    console.log(res)
                    let img = that.data.img
                    that.setData({
                        img: [...img, res.origin]
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
            urls: this.data.viewImg
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
    addGood(e){
        let goodinfo = this.data.goodItem
        let goods = this.data.goods
        if (goodinfo.Name.length === 0) {
            util.showModel('提示','请填写商品名称！')
            return false
        }
        if (goodinfo.Price.length === 0) {
            util.showModel('提示','请填写商品单价！')
            return false
        }
        if (goodinfo.Count.length === 0) {
            util.showModel('提示','请填写商品可售数量！')
            return false
        }
        goods = [...goods,goodinfo]
        this.setData({
            goods,
            goodEdit:false,
            goodItem:{
                Name:'',
                Price:'',
                Count:''
            }
        })
    },
    setGoodValue(e){
        let goodItem = this.data.goodItem
        let param = e.currentTarget.dataset.param
        goodItem[param] = e.detail.value
        this.setData({
            goodItem
        })
    },
    createNewGood(){
        this.setData({
            goodEdit:true
        })
    }
})