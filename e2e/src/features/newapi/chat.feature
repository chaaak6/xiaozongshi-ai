@newapi @journey @smoke @P0
Feature: NewAPI AI 中转站聊天
  作为企业用户，我希望通过 NewAPI 中转站与 AI 进行对话

  Background:
    Given 用户已登录系统
    And NewAPI 中转站已配置并可访问

  @NEWAPI-CHAT-001 @P0
  Scenario: 使用 NewAPI 发送消息并接收回复
    When 用户进入聊天页面
    And 用户在输入框中输入 "你好，请介绍一下自己"
    And 用户按下发送按钮
    Then 用户应该看到 AI 的流式回复
    And 回复内容应该包含 "AI" 字样

  @NEWAPI-CHAT-002 @P0
  Scenario: 多轮对话
    When 用户进入聊天页面
    And 用户发送消息 "你好"
    And 用户等待 AI 回复完成
    When 用户发送消息 "帮我写一段代码"
    Then 用户应该看到两个 AI 回复
    And 聊天页面应该显示完整的对话历史

  @NEWAPI-CHAT-003 @P1
  Scenario: NewAPI 设置页面可访问
    When 用户导航到设置页面
    And 用户在设置中打开 AI 供应商配置
    Then AI 中转站（NewAPI）供应商应该可见
    And NewAPI 应该排在供应商列表首位

  @NEWAPI-CHAT-004 @P1
  Scenario: 配置 NewAPI 服务器地址和 Token
    When 用户打开 NewAPI 供应商设置
    Then 设置页面应该包含 "服务器地址" 输入框
    And 设置页面应该包含 "访问令牌" 输入框
    And "服务器地址" 输入框的占位文本为 "https://your-company-newapi.com"

  @NEWAPI-CHAT-005 @P1
  Scenario: 连接测试功能
    When 用户打开 NewAPI 供应商设置
    And 用户填写有效的服务器地址和访问令牌
    And 用户点击连接测试按钮
    Then 应该显示连接成功的提示
