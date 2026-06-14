@admin @journey @P1
Feature: 管理后台 AI 供应商管理
  作为管理员，我希望能够在管理后台配置客户端可调用的 AI 供应商

  Background:
    Given 用户以管理员身份登录系统

  @ADMIN-PROV-001 @P1
  Scenario: 查看 AI 供应商列表
    When 用户导航到管理后台供应商管理 "/admin/providers"
    Then 页面标题 "AI供应商管理" 应该可见
    And 供应商表格中应该包含 "AI 中转站"
    And 供应商表格中应该包含 "OpenAI"

  @ADMIN-PROV-002 @P1
  Scenario: 可见供应商状态开关
    When 用户导航到管理后台供应商管理 "/admin/providers"
    Then 供应商 "AI 中转站" 应该显示为启用状态
    And 供应商应包含开关组件

  @ADMIN-PROV-003 @P1
  Scenario: 切换供应商启用状态
    When 用户导航到管理后台供应商管理 "/admin/providers"
    And 用户点击供应商 "AI 中转站" 的启用开关
    Then 应该显示成功提示 "供应商状态已更新"
