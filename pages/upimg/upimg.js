// pages/upimg/upimg.js
const qiniu = require('../../utils/qiniuUploader')
const token = require('../../utils/uptoken')
const url = 'https://weapp.fmcat.top'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgurl: '',
    x: 0,
    y: 0
  },
  tap: function (e) {
    this.setData({
      x: 30,
      y: 30
    });
  },
  upimg() {
    var that = this;
    // var options = {
    //   region: 'ECN', // 华北区
    //   // uptoken: 'xxxx',uploadURL: 'https://up.qbox.me',
    //   domain: 'http://omwunaw1m.bkt.clouddn.com',
    //   uptoken: token('video'),
    //   shouldUseQiniuFileName: false
    // }
    // qiniu.init(options)
    wx.chooseImage({
      count: 1,
      success: function (res) {
        // var filePath = res.tempFilePaths[0];
        // qiniu.upload(filePath,(res) => {
        //   that.setData({
        //     'imgurl': res.imageURL
        //   });
        // },(error) => {
        //   console.log(error);
        // },(e)=>{
        //   console.log(e)
        // })
        console.log(wx.getStorageSync('sessionId'))
        wx.uploadFile({
          url: url + '/order/uploadimg', //仅为示例，非真实的接口地址
          filePath: res.tempFilePaths[0],
          name: 'file',
          formData: {
            'user': 'test',
            sessionId: wx.getStorageSync('sessionId')
          },
          success: function (res) {
            let result = JSON.parse(res.data).result
            console.log(result)
            that.setData({
              'imgurl': result.origin
            });
            //do something
          }, fail: res => {
            console.log(res)
          }
        })
      }
    })
  }


  /**
   * 生命周期函数--监听页面加载
   */
})