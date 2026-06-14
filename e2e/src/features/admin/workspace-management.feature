@admin @journey @P0
Feature: 管理后台工作区管理
  作为管理员，我希望管理多个工作区，实现多租户隔离和资源分配

  Background:
    Given 用户以管理员身份登录系统

  @ADMIN-WS-001 @P0
  Scenario: 查看工作区列表
    When 用户导航到管理后台工作区管理 "/admin/workspaces"
    Then 页面标题 "工作区管理" 应该可见
    And 工作区列表应该显示至少一个工作区
    And 每个工作区应显示名称 成员数 和 创建时间

  @ADMIN-WS-002 @P0
  Scenario: 创建新工作区
    When 用户导航到管理后台工作区管理 "/admin/workspaces"
    And 用户点击 "创建工作区" 按钮
    And 用户输入工作区名称 "研发部"
    And 用户输入工作区描述 "研发部门专用工作区"
    And 用户点击确认创建
    Then 工作区列表应该包含 "研发部"

  @ADMIN-WS-003 @P0
  Scenario: 查看工作区成员
    When 用户导航到管理后台工作区管理 "/admin/workspaces"
    And 用户点击工作区 "研发部" 进入详情
    Then 成员列表应该显示
    And 成员列表应该有 添加成员 按钮

  @ADMIN-WS-004 @P0
  Scenario: 邀请用户加入工作区
    When 用户导航到工作区 "研发部" 的成员管理
    And 用户点击 "添加成员" 按钮
    And 用户输入邮箱 "newmember@company.com"
    And 用户选择角色 "工作空间成员"
    And 用户点击发送邀请
    Then 应该显示邀请发送成功提示

  @ADMIN-WS-005 @P0
  Scenario: 配置工作区模型白名单
    When 用户导航到工作区 "研发部" 的资源配置
    And 用户点击 "模型白名单" 设置
    And 用户勾选模型 "GPT 5.5" 和 "Claude Sonnet 4.6"
    And 用户点击保存
    Then 工作区 "研发部" 的成员应该只能使用这两个模型

  @ADMIN-WS-006 @P0
  Scenario: 设置工作区 Token 配额
    When 用户导航到工作区 "研发部" 的资源配置
    And 用户设置每月 Token 上限为 "1000000"
    And 用户点击保存
    Then 工作区 "研发部" 应该显示配额 "1000000 tokens/月"
