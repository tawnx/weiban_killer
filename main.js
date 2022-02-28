const { json } = require('body-parser');
const request = require('request');

var categoryCode = [101004004, 101004005, 101004006, 101004007, 101004008, 101004010, 101004011, 101005001, 101005003, 101005004, 101006001, 101007001];
var resourceId = [], userCourseId = [], resourceName = []
var courseNum

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}
function date(type) {
    if (type == 10) {
        return Date.parse(new Date()) / 1000;
    } else {
        return new Date().getTime()
    }
}
function getCourse(id) {
    return new Promise(function (resolve, reject) {
        var course_url = 'https://weiban.mycourse.cn/pharos/usercourse/listCourse.do?timestamp=' + date(10)
        var course_formData = {
            userProjectId: '17172279-4358-4d9c-92b9-9c8b69a8ca13',
            chooseType: '3',
            categoryCode: id,
            name: '',
            userId: '5ea19439-ceb9-43c5-a783-96541f706247',
            tenantCode: '363000005',
            token: '4269d711-30f4-48f5-b6dc-4bdfd9e16031'
        }
        request.post({ url: course_url, form: course_formData }, function (err, res, body) {
            resolve(body)
            /*var finished=0;
            var intervalObj = setInterval(()=> {
                finished++;
                if(finished==courseNum){
                clearInterval(intervalObj)
                }
            }, 15000);*/
        })
    })
}
function study(id) {
    return new Promise(function (resolve, reject) {
        var study_url = 'https://weiban.mycourse.cn/pharos/usercourse/study.do?timestamp=' + date(10)
        var study_formData = {
            courseId: id,
            userProjectId: '17172279-4358-4d9c-92b9-9c8b69a8ca13',
            tenantCode: '363000005',
            userId: '5ea19439-ceb9-43c5-a783-96541f706247',
            token: '4269d711-30f4-48f5-b6dc-4bdfd9e16031'
        }

        request.post({ url: study_url, form: study_formData }, function (err, res, body) {
            var study_json = JSON.parse(body)
            if (study_json.code == '0') {
                console.log('已学习课程:' + id)
                resolve(0)
            } else {
                console.log('学习课程失败:' + id)
                console.log(body)
                resolve(0)
            }
        })
    })
}
function finish(id) {
    return new Promise(function (resolve, reject) {
        var finish_url = 'https://weiban.mycourse.cn/pharos/usercourse/finish.do?callback=jQuery16409098152691548427_' + date(13) + '&userCourseId=' + id + '&tenantCode=363000005&_=' + date(13)
        request(finish_url, function (err, res, body) {
            if (body.indexOf('ok') >= 0) {
                console.log('已完成课程:' + id)
                resolve()
            } else {
                console.log('完成课程失败:' + id)
                console.log(body)
                resolve()
            }
        })
    })
}
async function main() {
    for (var i = 0; i < categoryCode.length; i++) {
        //遍历每一个课程组
        console.log('正在获取课程:' + categoryCode[i]);
        var course_json = JSON.parse(await getCourse(categoryCode[i]))
        courseNum = course_json.data.length
        //console.log(course_json)

        for (var j = 0; j < courseNum; j++) {
            resourceId[j] = course_json.data[j].resourceId
            userCourseId[j] = course_json.data[j].userCourseId
            resourceName[j] = course_json.data[j].resourceName
            await study(resourceId[j])
            await sleep(10000)
            //学习课程后需要10s左右完成才有效
            await finish(userCourseId[j])
        }
    }
}
main()
