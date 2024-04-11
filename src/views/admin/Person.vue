<template>
    <el-container>
        <el-header class="homeHeader">
            <div class="title">工客管理后台|<el-button type="primary" icon="el-icon-s-platform" @click="chat()">聊天室</el-button></div>
            <div>
                <el-dropdown class="choices" @command="commandHandler">
                    <span class="el-dropdown-link">
                      {{user.nickname}}<i><img :src=picUri+user.pic></i>
                    </span>
                    <el-dropdown-menu>
                        <el-dropdown-item command="userInfo">个人中心</el-dropdown-item>
                        <el-dropdown-item command="pwdUpdate">修改密码</el-dropdown-item>
                        <el-dropdown-item command="logout" divided>注销登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </el-header>
        <el-main>
            <div class="personInfo">
                <el-form ref="userForm" :rules="rules" :model="userForm" label-width="80px">
                    <el-breadcrumb separator-class="el-icon-arrow-right" v-if="this.$router.currentRoute.path!='/home'">
                        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
                        <el-breadcrumb-item>{{this.$router.currentRoute.name}}</el-breadcrumb-item>
                    </el-breadcrumb>
                    <el-form-item label="昵称:" prop="nickname">
                        <el-input type="text" v-model="userForm.nickname" auto-complete="off" placeholder="请输入昵称"></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱:" prop="email">
                        <el-input type="text" v-model="userForm.email" auto-complete="off" placeholder="请输入邮箱"></el-input>
                    </el-form-item>
                    <el-form-item label="手机:" prop="phone">
                        <el-input type="text" v-model="userForm.phone" auto-complete="off" placeholder="请输入手机号"></el-input>
                    </el-form-item>
                    <el-form-item label="用户头像：" :label-width="formLabelWidth">
                        <el-upload
                            action="/im-file/file/upload"
                            ref="upload"
                            list-type="picture-card"
                            :class="{disabled:uploadDisabled}"
                            :before-upload="beforeAvatarUpload"
                            :file-list="fileList"
                            :on-progress="onProgress"
                            :on-success="imgSuccess"
                            :on-error="imgError"
                            :on-remove="imgRemove"
                        >
                            <i  class="el-icon-plus"></i>
                            <div slot="tip" class="el-upload__tip">只能上传不超过4MB的图片(可使用默认头像！)</div>
                        </el-upload>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submit('userForm') " style="width: 100%">提交</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-main>
    </el-container>
</template>

<script>
export default {
    name: "Person",
    data(){
        var validateNickname = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入昵称'));
            }
            callback();
        };
        return{
            user:JSON.parse(window.localStorage.getItem("user")),//user的JSON对象
            picUri:this.$store.state.fileUri,
            userForm:{
                id:'',
                nickname:'',
                email:'',
                phone:'',
                pic:'',
            },
            rules: {
                nickname: [
                    { require: true, validator: validateNickname, trigger: 'blur' }
                ],
            },
            uploadDisabled:false,
            //上传的文件信息列表
            fileList:[],
            formLabelWidth: '120px',
        }
    },
    mounted() {
        this.postRequest("/im-rbac/sys/user/queryInfo", {uid:this.user.uid},false).then(resp=>{
            if (resp && resp.success){
                let retData=resp.data;
                this.userForm.id=retData.id;
                this.userForm.nickname=retData.nickname;
                this.userForm.email=retData.email;
                this.userForm.phone=retData.phone;
            }
        })
    },
    methods:{
        chat(){
            let path=this.$route.query.redirect;
            this.$router.replace((path=='/'||path==undefined)?"/chatroom":path);
        },
        commandHandler(cmd){
            //注销登录操作
            if (cmd==='logout'){
                this.$confirm('此操作将注销登录, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.postRequest("/im-rbac/sys/logout",null,false,null);
                    window.localStorage.removeItem("user");//删除session
                    this.$router.replace('/');//页面替换为登陆页Login.vue
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消操作'
                    });
                });
            }else if (cmd==='userInfo'){
                this.$router.push('/person');
            }else if (cmd==='pwdUpdate'){
                this.$router.push('/pwdUpdate');
            }
        },
        /**
         *       图片上传的方法
         */
        //上传前
        beforeAvatarUpload(file) {
            let isLt4M = file.size / 1024 / 1024 < 4;

            if (!isLt4M) {
                this.$message.error('上传头像图片大小不能超过 4MB!');
            }
            return isLt4M;
        },
        // 上传中
        onProgress(event, file, fileList){
            this.uploadDisabled = true;
        },
        // 图片上传成功
        imgSuccess(response, file, fileList) {
            this.uploadDisabled = true;
            this.registerForm.pic=response.data.uid;//将返回的路径给表单的头像属性
            console.log("图片url为："+this.registerForm.pic);
        },
        // 图片上传失败
        imgError(err, file, fileList){
            this.$message.error("上传失败");
            this.uploadDisabled = false;
        },
        //移除图片
        imgRemove(file,fileList){
            this.uploadDisabled = false;
        },
        submit(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.postRequest("/im-rbac/sys/user/update",this.userForm,true,"修改成功").then(resp=>{
                        if (resp && resp.success){
                            location.reload();//刷新页面，清空注册界面的上传组件中的图片
                        }
                    });
                } else {
                    this.$message.error("请正确填写信息！");
                    console.log('error submit!!');
                    return false;
                }
            });
        },
    }
}
</script>

<style>
.homeHeader{
    background-color: #409eff;
    display: flex;/*flex布局*/
    align-items: center;/*cross交叉轴中*/
    justify-content: space-between;/*左右两侧（main主轴）对齐*/
    padding:0px;
    box-sizing:border-box;
}
.homeHeader .title{
    font-size: 30px;
    font-family: 华文行楷;
    color:#ffffff;
}
.homeHeader .choices{
    cursor: pointer;
}
.choices img{
    width: 48px;
    height: 48px;
    border-radius: 24px;
    margin-left: 10px;
}
.el-dropdown-link{
    display: flex;
    align-items: center;
}
</style>