@admin @journey @P1
Feature: 会话存档查看
  作为管理员，我希望能够查看所有用户的会话记录

  Background:
    Given 用户以管理员身份登录系统

  @ADMIN-SESS-001 @P1
  Scenario: 查看会话存档列表
    When 用户导航到管理后台会话存档 "/admin/sessions"
    Then 页面标题 "会话存档" 应该可见
    And 会话列表表格应该显示
    And 表格中应该包含 "zhangsan@company.com" 的会话

  @ADMIN-SESS-002 @P1
  Scenario: 通过搜索栏过滤会话
    When 用户导航到管理后台会话存档 "/admin/sessions"
    And 用户在搜索框中输入 "zhangsan"
    Then 会话列表应该只显示匹配的会话

  @ADMIN-SESS-003 @P1
  Scenario: 点击会话行查看详情
    When 用户导航到管理后台会话存档 "/admin/sessions"
    And 用户点击会话列表中的第一行
    Then 页面应该跳转到会话详情页 "/admin/sessions/sess-001"
    And 详情页应该显示会话消息内容
