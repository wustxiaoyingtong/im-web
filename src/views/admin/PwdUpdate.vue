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
                <el-form ref="pwdForm" :rules="rules" :model="pwdForm" label-width="80px">
                    <el-breadcrumb separator-class="el-icon-arrow-right" v-if="this.$router.currentRoute.path!='/home'">
                        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
                        <el-breadcrumb-item>{{this.$router.currentRoute.name}}</el-breadcrumb-item>
                    </el-breadcrumb>
                    <el-form-item label="原密码:" prop="oldPassword">
                        <el-input type="password" v-model="pwdForm.oldPassword" autocomplete="off" placeholder="请输入原密码"></el-input>
                    </el-form-item>
                    <el-form-item label="新密码:" prop="password">
                        <el-input type="password" v-model="pwdForm.password" autocomplete="off" placeholder="请输入新密码"></el-input>
                    </el-form-item>
                    <el-form-item label="确认密码:" prop="checkPass">
                        <el-input type="password" v-model="pwdForm.checkPass" autocomplete="off" placeholder="请再次输入新密码"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submit('pwdForm') " style="width: 100%">提交</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-main>
    </el-container>
</template>

<script>
export default {
    name: "PwdUpdate",
    data(){
        var validateOldPassword = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入原密码'));
            }
            callback();
        };
        var validatePassword = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入新密码'));
            } else {
                if (this.pwdForm.checkPass !== '') {
                    this.$refs.pwdForm.validateField('checkPass');
                }
                callback();
            }
        };
        var validateCheckPass = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请再次输入新密码'));
            } else if (value !== this.pwdForm.password) {
                callback(new Error('两次输入新密码不一致!'));
            } else {
                callback();
            }
        };
        return{
            user:JSON.parse(window.localStorage.getItem("user")),//user的JSON对象
            picUri:this.$store.state.fileUri,
            pwdForm:{
                id:'',
                password:'',
                checkPass:'',
                oldPassword:'',
            },
            rules: {
                oldPassword: [
                    { require: true, validator: validateOldPassword, trigger: 'blur' }
                ],
                password: [
                    { require: true, validator: validatePassword, trigger: 'blur' }
                ],
                checkPass: [
                    { require: true, validator: validateCheckPass, trigger: 'blur' }
                ],
            }
        }
    },
    mounted() {
        this.postRequest("/im-rbac/sys/user/queryInfo", {uid:this.user.uid},false).then(resp=>{
            if (resp && resp.success){
                let retData=resp.data;
                this.pwdForm.id=retData.id;
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
        submit(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.postRequest("/im-rbac/sys/user/changePwd",this.pwdForm,true,"修改成功").then(resp=>{
                        if (resp && resp.success){
                            this.$router.replace('/');
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