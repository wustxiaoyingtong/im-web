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
            @selection-change="handleSelectionChange"
            style="width: 100%">
      <el-table-column
              type="selection"
              width="40"
              align="center">
      </el-table-column>
      <el-table-column
              prop="id"
              label="编号"
              width="50"
              align="center">
      </el-table-column>
      <el-table-column
              prop="username"
              label="用户名"
              width="120"
              align="center">
      </el-table-column>
      <el-table-column
              prop="nickname"
              label="昵称"
              width="150"
              align="center">
      </el-table-column>
      <el-table-column
              label="用户头像"
               width="100" align="center">
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
               width="160" align="center">
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
                width="180"
                align="center">
      </el-table-column>
      <el-table-column
                prop="phone"
                label="手机"
                width="130"
                align="center">
      </el-table-column>
      <el-table-column
                prop="createAt"
                label="创建时间"
                width="160"
                align="center">
      </el-table-column>
      <el-table-column label="操作" width="150" align="center">
        <template slot-scope="scope">
          <el-button
                  size="mini"
                  @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button
                  size="mini"
                  type="danger"
                  @click="handleDelete(scope.row)">删除</el-button>
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
</div>
</template>

<script>
  export default {
    name: "UserInfo",
    data(){
      return{
        picUri:this.$store.state.fileUri,
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
      //删除单个用户
      handleDelete(data){
        this.$confirm('此操作将永久删除用户【'+data.nickname+'】, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.deleteRequest("/user/"+data.id).then(resp=>{
            if (resp){
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
      }
    }
  }
</script>

<style scoped>
</style>
