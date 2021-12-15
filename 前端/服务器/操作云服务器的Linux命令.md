## 安装：
- 下载：`yum install ...`（阿里云服务器默认安装了 yum ，没有 yum 的可用 apt 代替）
- 检查是否安装：`rpm -qa ...`【有输出说明已安装，如果没有输出则没有安装，需使用安装命令进行安装】
## 操作文件
```
ls　　          显示文件或目录
  -l                列出文件详细信息l(list)
  -a                列出当前目录下所有文件及目录，包括隐藏的a(all)
mkdir           创建目录
  -p                创建目录，若无父目录，则创建p(parent)
cd              切换目录
touch           创建空文件
echo            创建带有内容的文件。
cat             查看文件内容
cp              拷贝
mv              移动或重命名
rm              删除文件
  -r                递归删除，可删除子目录及文件
  -f                强制删除
find            在文件系统中搜索某文件
wc              统计文本中行数、字数、字符数
grep            在文本文件中查找某个字符串
rmdir           删除空目录
tree            树形结构显示目录，需要安装tree包
pwd             显示当前目录
ln              创建链接文件
more、less      分页显示文本文件内容
head、tail      显示文件头、尾内容
ctrl+alt+F1     命令行全屏模式
```
## 打包压缩
```
gzip：            压缩方式一
bzip2：           压缩方式二
后面可带参数：
  -c              归档文件
  -x              压缩文件
  -z              gzip压缩文件
  -j              bzip2压缩文件
  -v              显示压缩或解压缩过程 v(view)
  -f              使用档名

例：
tar -cvf /home/abc.tar /home/abc           只打包，不压缩
tar -zcvf /home/abc.tar.gz /home/abc       打包，并用gzip压缩
tar -jcvf /home/abc.tar.bz2 /home/abc      打包，并用bzip2压缩

当然，如果想解压缩，就直接将上面命令 tar -cvf  / tar -zcvf  / tar -jcvf 中的 “c” 换成 “x” 就可以了。
```
## 服务
- 查看服务运行状态：`ps -ef | gref ...`
- 启动tomcat：`./startup.sh`；关闭：`./shutdown.sh`
- 查询所有开放端口信息：`netstat -anp`
## 检查Linux上防火墙是否关闭
- 输入命令关闭：`systemctl stop firewalld.service`
- 输入命令开启：`systemctl start firewalld.service`
- 查看防火墙状态：`firewall-cmd --state`（not running表示关闭，running表示开启)
- 查询所有开放的端口：`firewall-cmd --list-all`
- 查询指定端口是否开放：`firewall-cmd --query-port=8080/tcp`（yes：开放；no：未开放）
- 开放指定端口：`firewall-cmd --add-port=8080/tcp --permanent`
- 移除指定端口：`firewall-cmd --permanent --remove-port=8080/tcp`
- 重载新开放的端口：`firewall-cmd --reload`
## 在服务器上访问 ip
- 连接方式：`curl http://（ip地址）`
- 查看日志：`nginx access.log`（日志未滚动，代表本机访问不到公网ip）
- 网络检测：1)ping主机可以；2)telnet 主机3306端口不可以；telnet 主机22端口可以。则说明与本机网络没有关系；

> 学习资料：[ Linux 服务器中常用操作命令](https://www.cnblogs.com/laov/p/3541414.html)