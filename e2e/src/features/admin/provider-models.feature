@admin @journey @P0
Feature: 管理后台 AI 供应商与模型管理
  作为管理员，我希望统一管理 AI 供应商和可用模型，用户无需自行配置 API Key

  Background:
    Given 用户以管理员身份登录系统

  @ADMIN-PROV-001 @P0
  Scenario: 查看 AI 供应商列表
    When 用户导航到管理后台供应商管理 "/admin/providers"
    Then 页面标题 "AI供应商管理" 应该可见
    And 供应商表格中应该包含 "AI 中转站"
    And 供应商表格中应该包含 API Key 配置状态列
    And 供应商表格中应该包含 启用开关列

  @ADMIN-PROV-002 @P0
  Scenario: 全局配置 NewAPI 服务器地址和 Token
    When 用户导航到管理后台供应商管理 "/admin/providers"
    And 用户点击供应商 "AI 中转站" 进入详情
    Then 详情页应该包含 "服务器地址" 配置项
    And 详情页应该包含 "全局Token" 配置项
    And 配置项应有 "测试连接" 按钮

  @ADMIN-PROV-003 @P0
  Scenario: 查看某供应商下的可用模型列表
    When 用户导航到管理后台供应商管理 "/admin/providers"
    And 用户点击供应商 "AI 中转站" 查看模型
    Then 模型列表应该显示至少一个模型
    And 每个模型应该有 启用开关 显示名称 和 模型ID

  @ADMIN-PROV-004 @P0
  Scenario: 启用/禁用某个模型
    When 用户导航到管理后台模型管理页面
    And 用户点击模型 "gpt-5.5" 的启用开关
    Then 应该显示成功提示

  @ADMIN-PROV-005 @P0
  Scenario: 将模型分配给指定工作区
    When 用户导航到管理后台模型管理页面
    And 用户点击模型 "gpt-5.5" 的工作区分配按钮
    And 用户勾选工作区 "默认工作区"
    And 用户点击确认
    Then 该模型应该在工作区 "默认工作区" 可用
