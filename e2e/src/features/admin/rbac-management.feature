@admin @journey @P0
Feature: 管理后台 RBAC 权限管理
  作为管理员，我希望基于 RBAC 模型管理用户角色和权限，控制功能访问

  Background:
    Given 用户以管理员身份登录系统

  @ADMIN-RBAC-001 @P0
  Scenario: 查看角色列表
    When 用户导航到管理后台权限管理 "/admin/rbac"
    Then 页面标题 "权限管理" 应该可见
    And 角色列表应该显示系统预设角色
    And 角色列表包含 "超级管理员"
    And 角色列表包含 "管理员"
    And 角色列表包含 "工作空间所有者"
    And 角色列表包含 "工作空间成员"
    And 角色列表包含 "工作空间查看者"

  @ADMIN-RBAC-002 @P0
  Scenario: 编辑角色权限
    When 用户导航到管理后台权限管理 "/admin/rbac"
    And 用户点击角色 "管理员" 的权限编辑按钮
    Then 权限编辑面板应该显示
    And 权限列表按模块分组显示

  @ADMIN-RBAC-003 @P0
  Scenario: 为用户分配角色
    When 用户导航到管理后台用户管理 "/admin/users"
    And 用户点击用户 "269076397@qq.com" 的角色编辑按钮
    And 用户选择角色 "管理员"
    And 用户点击确认
    Then 该用户应该显示 "管理员" 角色标签

  @ADMIN-RBAC-004 @P0
  Scenario: 创建自定义角色
    When 用户导航到管理后台权限管理 "/admin/rbac"
    And 用户点击 "创建角色" 按钮
    And 用户输入角色名称 "自定义审核员"
    And 用户勾选权限 "会话查看" 和 "用户管理"
    And 用户点击保存
    Then 角色列表应该包含 "自定义审核员"

  @ADMIN-RBAC-005 @P0
  Scenario: 非管理员尝试访问管理后台被拒绝
    Given 用户以工作空间成员身份登录系统
    When 用户尝试导航到 "/admin/rbac"
    Then 应该显示无权限提示或重定向到首页
