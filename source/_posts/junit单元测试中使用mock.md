---
title: springboot单元测试中使用 mock
date: 2018-07-20 00:00:00
tags: [java, springboot]
typora-root-url: ../
---

使用场景：

做单元测试时，需要依赖一个RPC接口，而该接口并不是测试所关心的地方，可以一个使用mock来返回一个虚假的值而避免复杂化测试过程。

以此类推，要依赖任何和测试无关并且比较复杂/执行慢/接口在变化or不确定的代码，都可以使用mock

```java
// ApplicationTest是springboot单元测试的启动类，本例通过继承方式加载
// 设置单元测试的配置文件，通常放在test目录下
@ActiveProfiles("mock-test")
public class RestrictCheckServiceImplTest extends ApplicationTest {

    private static Logger LOG =
            LoggerFactory.getLogger(RestrictCheckServiceImplTest.class);

    // mock对象
    @Mock
    @Autowired
    private ArrangeAssistMaintain arrangeAssistMaintain;

    // mock注入对象(测试类)
    @InjectMocks
    @Autowired
    private RestrictCheckServiceImpl restrictCheckService;


    @Before
    public void mockClassroom(){
        MockitoAnnotations.initMocks(this);
        // 当调用 getClassroomById(Long id) 方法时，执行mock方法
        Mockito.when(arrangeAssistMaintain.getClassroomById(Mockito.anyLong()))
                .thenAnswer((Answer<Classroom>) invocationOnMock -> {
            Long classroomId = invocationOnMock.getArgumentAt(0, Long.class);
            LOG.info("============ mock 教室 ============");
            Classroom classroom = new Classroom();
            classroom.setId(classroomId);
            classroom.setType("1");
            classroom.setName("mock教室");
            return classroom;
        });
    }
    @Test
    public void getClassroom(){
        Classroom classroom = restrictCheckService.getClassroom(1);
        System.out.println(ToStringBuilder.reflectionToString(classroom));
        ...
        ...
    }
}
```

其中要注意的地方:

1. 记得在配置mock的代码**之前** 执行 *MockitoAnnotations.initMocks(this);*
1. 被 **@InjectMocks**  标记注入的类 (在本例中为 **RestrictCheckServiceImpl**)，一定要有被注入类的set方法，否则注入失败，并且不会报出任何异常
1. mock对象的变量名尽量与被注入类中的变量名相同，经验证变量名不同也可以注入，但当存在多个同类型变量时，可能会产生困扰

