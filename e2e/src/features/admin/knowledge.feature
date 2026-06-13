@admin @journey @P2
Feature: 知识库管理
  作为管理员，我希望能够管理知识库并分配访问权限

  Background:
    Given 用户以管理员身份登录系统

  @ADMIN-KB-001 @P2
  Scenario: 查看知识库列表
    When 用户导航到管理后台知识库管理 "/admin/knowledge"
    Then 页面标题 "知识库管理" 应该可见
    And 表格中应该包含知识库 "公司规章制度"

  @ADMIN-KB-002 @P2
  Scenario: 打开知识库权限管理弹窗
    When 用户导航到管理后台知识库管理 "/admin/knowledge"
    And 用户点击知识库 "技术文档" 的权限管理按钮
    Then 权限管理弹窗应该显示
    And 弹窗标题为 "权限管理"

  @ADMIN-KB-003 @P2
  Scenario: 为用户分配知识库访问权限
    When 用户导航到管理后台知识库管理 "/admin/knowledge"
    And 用户点击知识库的权限管理按钮
    And 用户在弹窗中选择授权类型 "user"
    And 用户输入授权对象 ID "u2"
    And 用户选择访问级别 "write"
    And 用户点击确认授权
    Then 应该显示成功提示 "权限授予成功"
