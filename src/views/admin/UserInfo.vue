<template>
<div>
  <div>
    账号状态：
    <el-select v-model="stateValue" placeholder="请选择">
      <el-option
              v-for="item in stateOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
      </el-option>
    </el-select>
    <el-input placeholder="输入用户昵称进行搜索"
              prefix-icon="el-icon-search"
              style="width: 200px;margin: 0 10px"
               v-model="nameKeyword"></el-input>
    <el-button @click="initUserData" icon="el-icon-search" type="primary">搜索</el-button>
    <el-button @click="refreshTable" icon="el-icon-refresh" type="primary">重置</el-button>
  </div>
  <div style="margin-top: 20px;width: 1241px">
    <el-table
            :data="userData"
            stripe
            border
            v-loading="loading"
            style="width: 100%">
      <el-table-column
              prop="id"
              label="编号"
              align="center"
              :min-width="'4%'">
      </el-table-column>
      <el-table-column
              prop="username"
              label="用户名"
              align="center"
              :min-width="'7%'">
      </el-table-column>
      <el-table-column
              prop="nickname"
              label="昵称"
              align="center"
              :min-width="'12%'">
      </el-table-column>
      <el-table-column
              label="用户头像"
              align="center"
              :min-width="'8%'">
        <template slot-scope="scope">
          <el-image :src="picUri+scope.row.pic"
                    :preview-src-list="[picUri+scope.row.pic]"
                    style="width: 50px;height: 50px">
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column
              label="用户状态"
              align="center"
              :min-width="'12%'">
        <template slot-scope="scope">
        <el-switch
                v-model="scope.row.isDisabled===0"
                @change="changeLockedStatus(scope.row)"
                active-text="启用"
                inactive-text="禁用"
                active-color="#13ce66"
                inactive-color="#ff4949">
        </el-switch>
        </template>
      </el-table-column>
      <el-table-column
                prop="email"
                label="邮箱"
                align="center"
                :min-width="'12%'">
      </el-table-column>
      <el-table-column
                prop="phone"
                label="手机"
                align="center"
                :min-width="'11%'">
      </el-table-column>
      <el-table-column
                prop="createAt"
                label="创建时间"
                align="center"
                :min-width="'14%'">
      </el-table-column>
      <el-table-column label="操作" align="center"
                       :min-width="'20%'">
        <template slot-scope="scope">
          <el-button
                  size="mini"
                  type="danger"
                  @click="resetPwd(scope.row)" :disabled="isAdmin">重置密码</el-button>
          <el-button
                  size="mini"
                  @click="handleEdit(scope.$index, scope.row)" :disabled="isAdmin">编辑</el-button>
          <el-button
                  size="mini"
                  type="danger"
                  @click="handleDelete(scope.row)" :disabled="isAdmin">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="display: flex;justify-content: space-between;margin-top: 10px">
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :page-sizes="[10, 20, 30, 40]"
              :page-size="10"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              style="display: inline-block">
      </el-pagination>
    </div>
  </div>
  <el-dialog title="修改用户信息" :before-close="closeUpdateDialog" :visible.sync="updateDialogVisible" width="30%">
    <el-form :model="updateForm" status-icon :rules="rules" ref="updateForm" >
      <el-form-item label="用户名：" :label-width="formLabelWidth" prop="username">
        <el-input v-model=" updateForm.username" autocomplete="off" placeholder="请输入用户名" disabled></el-input>
      </el-form-item>
      <el-form-item label="昵称：" :label-width="formLabelWidth" prop="nickname">
        <el-input v-model="updateForm.nickname" autocomplete="off" placeholder="请输入昵称"></el-input>
      </el-form-item>
      <el-form-item label="邮箱：" :label-width="formLabelWidth" prop="email">
        <el-input v-model="updateForm.email" autocomplete="off" placeholder="请输入邮箱"></el-input>
      </el-form-item>
      <el-form-item label="手机：" :label-width="formLabelWidth" prop="phone">
        <el-input v-model.number="updateForm.phone" autocomplete="off" placeholder="请输入手机号"></el-input>
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
    </el-form>
    <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitUpdateForm('updateForm') " style="width: 100%">提交</el-button>
    </div>
  </el-dialog>
</div>
</template>

<script>
  export default {
    name: "UserInfo",
    data(){
      var validateNickname = (rule, value, callback) => {
          if (value === '') {
              callback(new Error('请输入昵称'));
          }
          callback();
      };
      return{
        picUri:this.$store.state.fileUri,
        updateDialogVisible:false,
        isAdmin:JSON.parse(window.localStorage.getItem("user")).username!=='admin',
        stateValue:-1,//默认用户状态
        stateOptions:[
          {
            label:'请选择',
            value:-1
          },
          {
            label:'未锁定',
            value:0
          },
          {
            label:'已锁定',
            value:1
          }
        ],
        userData:[],
        total:0,//表格数据总数
        page:1,//当前页的页数
        size:10,//当前页的显示条数
        nameKeyword:'',//搜索关键字
        loading:false,//加载动画
        formLabelWidth: '120px',
        uploadDisabled:false,
        //上传的文件信息列表
        fileList:[],
        updateForm:{
          id:'',
          username:'',
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
      }
    },
    mounted(){
      this.initUserData();
    },
    methods:{
      //获取表格数据
      initUserData(){
        this.loading=true;
        let url="/im-rbac/sys/user/query";
        let queryData={
          "nickname":this.nameKeyword,
          "isDisabled":this.stateValue,
          "pageNo":this.page,
          "pageSize":this.size
        }
        this.postRequest(url, queryData,false).then(resp=>{
          if (resp && resp.success){
            this.userData=resp.data.list;
            this.total=resp.data.total;
            setTimeout(()=>{
                this.loading=false;
            },1000)
          }
        })
      },
      //改变当前页大小的回调函数
      handleSizeChange(val){
        this.size=val;
        this.initUserData();
      },
      //改变当前页数的回调函数
      handleCurrentChange(val){
        this.page=val;
        this.initUserData();
      },
      //刷新表格
      refreshTable(){
        this.nameKeyword='';
        this.stateValue=-1;
        this.initUserData();
      },
      //更改用户锁定状态
      changeLockedStatus(data){
        let updateData={
          "id":data.id,
          "isDisabled":data.isDisabled?0:1,
        }
        this.postRequest("/im-rbac/sys/user/update", updateData,false).then(resp=>{
          if (resp && resp.success){
            this.initUserData();
          }
        })
      },
      resetPwd(data){
        this.$confirm('确定重置密码', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
            this.postRequest("/im-rbac/sys/user/resetPwd", {id:data.id},true,"重置成功");
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      //编辑单个用户
      handleEdit(index,data){
        this.$confirm('确定修改【'+data.nickname+'】', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.updateForm={//清空表单
            id:data.id,
            username:data.username,
            nickname:data.nickname,
            email:data.email,
            phone:data.phone,
            pic:'',
          };
          this.updateDialogVisible=true;
        }).catch(() => {
          this.$message({
              type: 'info',
              message: '已取消删除'
          });
        });
      },
      //删除单个用户
      handleDelete(data){
        this.$confirm('此操作将永久删除用户【'+data.nickname+'】, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.postRequest("/im-rbac/sys/user/delete/"+data.id,null,true,"删除成功").then(resp=>{
            if (resp && resp.success){
              //刷新表格
              this.initUserData();
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      closeUpdateDialog(done){
        this.updateForm={//清空表单
          id:'',
          username:'',
          nickname:'',
          email:'',
          phone:'',
          pic:'',
        };
        //this.$refs.upload.clearFiles();//清除上传组件的图片
        done();//关闭对话框
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
          this.updateForm.pic=response.data.uid;//将返回的路径给表单的头像属性
          console.log("图片url为："+this.updateForm.pic);
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
      //提交修改操作
      submitUpdateForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.postRequest("/im-rbac/sys/user/update",this.updateForm,true,"修改成功").then(resp=>{
              if (resp && resp.success){
                this.updateDialogVisible=false;
                //刷新表格
                this.initUserData();
              }
            })
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

<style scoped>
</style>
