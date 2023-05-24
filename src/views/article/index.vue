<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.varCode" placeholder="暂不支持搜索" clearable style="width: 240px;margin-left:15px;" class="filter-item" />
      <el-button v-waves class="filter-item" type="primary" style="margin-left:15px;" clearable icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button v-waves class="filter-item" type="success" style="margin-left:15px;" clearable icon="el-icon-search" @click="handleCreate">
        新增
      </el-button>
    </div>
    <el-table ref="multipleTable" :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;" @selection-change="handleSelectionChange" @sort-change="sortChange">
      <el-table-column label="选择" width="40px" align="center" type="selection" />
      <el-table-column label="ArticleID" prop="articleId" align="center" width="160px" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.articleId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" prop="title" align="center" width="240px">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="正文" prop="content" align="center" width="300px">
        <template slot-scope="{row}">
          <span>{{ row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发布状态" prop="publishState" align="center" width="180px">
        <template slot-scope="{row}">
          <span>{{ row.publishState }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createdTime" align="center" width="200px">
        <template slot-scope="{row}">
          <span>{{ row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" prop="modifiedTime" align="center" width="200px">
        <template slot-scope="{row}">
          <span>{{ row.modifiedTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="170px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="showTitleDialog(row)">
            修改标题
          </el-button>
          <el-button type="warning" size="mini" @click="toPublish(row)">
            发布
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <el-dialog title="创建Article草稿" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 600px; margin-left:50px;">
        <el-form-item label="标题" prop="title">
          <el-input v-model="temp.title" placeholder="请输入标题" :readonly="isDisable" />
        </el-form-item>
        <el-form-item label="正文" prop="content">
          <el-input v-model="temp.content" type="textarea" placeholder="请输入正文" :readonly="isDisable" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="createData()">
          确认
        </el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改Article标题" :visible.sync="titleDialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 600px; margin-left:50px;">
        <el-form-item label="标题" prop="title">
          <el-input v-model="temp.title" placeholder="请输入标题" :readonly="isDisable" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="titleDialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="doModifyTitle()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { fetchListByPage, createArticleDraft, modifyTitle, publishArticle } from '@/api/article'
export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    isSotreFilter(inVal) {
      const isSotreMap = {
        0: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return isSotreMap[inVal]
    }
  },
  data() {
    return {
      isDisable: false,
      multipleSelection: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pageSize: 10,
        importance: undefined,
        title: undefined,
        scope: undefined,
        sort: '+id',
        g: ''
      },
      importanceOptions: [1, 2, 3],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        timestamp: new Date(),
        articleId: '',
        title: '',
        content: ''
      },
      dialogFormVisible: false,
      titleDialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      pvData: [],
      rules: {
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    scopeSelectChage() {
      if (this.listQuery.g === '-1') {
        return
      }
      this.listQuery.scope = ''
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    getList() {
      this.listLoading = true
      fetchListByPage(this.listQuery).then(response => {
        this.list = response.payload.list
        this.total = response.payload.total
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      if (this.listQuery.g === '-1') {
        this.listQuery.scope = -1
      }
      console.log(this.listQuery)
      if (this.listQuery.scope !== undefined && this.listQuery.scope !== '') {
        var pattern = /^-?[1-9]\d*$/
        if (!pattern.test(this.listQuery.scope)) {
          console.log('非数字')
          this.$message.error('参数范围必需为数字')
          return
        }
      }
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    handleCreate() {
      this.isDisable = false
      this.resetTemp()
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createArticleDraft(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
      this.getList()
    },
    showTitleDialog(row) {
      this.isDisable = false
      console.log(row)
      this.temp.articleId = row.articleId
      this.temp.title = row.title
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.titleDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    doModifyTitle() {
      this.isDisable = true
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          modifyTitle(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.titleDialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    toPublish(row) {
      this.$confirm('即将发布, 请确认', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        publishArticle({ 'articleId': row.articleId }).then(() => {
          this.getList()
        })
        this.$message({
          type: 'success',
          message: '发布成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消发布'
        })
      })
    },
    handleUpdate(row) {
      this.isDisable = true
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    async deleteData() {
      if (this.multipleSelection.length === 0) {
        this.$notify({
          title: '删除参数配置',
          message: '未选中',
          type: 'warning',
          duration: 2000
        })
        return
      }
      this.$confirm('此操作将删除选中的参数配置, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.doDelete()
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
<style scoped>
</style>
