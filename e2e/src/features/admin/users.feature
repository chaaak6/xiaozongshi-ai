@admin @journey @P1
Feature: 用户管理
  作为管理员，我希望能够查看和管理系统用户

  Background:
    Given 用户以管理员身份登录系统

  @ADMIN-USER-001 @P1
  Scenario: 查看用户列表
    When 用户导航到管理后台用户管理 "/admin/users"
    Then 页面标题 "用户管理" 应该可见
    And 表格中应该包含用户 "张三"

  @ADMIN-USER-002 @P1
  Scenario: 搜索用户
    When 用户导航到管理后台用户管理 "/admin/users"
    And 用户在搜索框中输入 "张三"
    Then 表格应该只显示匹配的用户
