##

```bash
# 找出 nats pod name
kubectl get pods

# 設定 port
kubectl port-forward nats-depl-6df7ff4696-46xrc 4222:4222

# 運行 publish
npm run publish

# 啟用監聽 logs 的 port 8222
kubectl port-forward nats-depl-6df7ff4696-46xrc 8222:8222

# 使用瀏覽器查看 http://localhost:8222/streaming
# 查看當前已經 listener 詳細資料 http://localhost:8222/streaming/channelsz?subs=1
```
