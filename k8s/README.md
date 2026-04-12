# Kubernetes manifests for EduCycle

Apply order:
1. `kubectl apply -f secret.yaml`
2. `kubectl apply -f configmap.yaml`
3. `kubectl apply -f postgres-pvc.yaml`
4. `kubectl apply -f postgres-deployment.yaml -f postgres-service.yaml`
5. `kubectl apply -f backend-deployment.yaml -f backend-service.yaml`
6. `kubectl apply -f frontend-deployment.yaml -f frontend-service.yaml`
7. `kubectl apply -f ingress.yaml`
8. `kubectl apply -f hpa.yaml`

Lưu ý:
- Thay image tag bằng image thật từ CI/CD.
- Không dùng `stringData` secret mặc định ở production.
- Cần có NGINX Ingress Controller trước khi apply `ingress.yaml`.
