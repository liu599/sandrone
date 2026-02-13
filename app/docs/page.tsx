'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

let singleMicroApp: any = null;

export default function DocsPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(true);
  const [product, setProduct] = useState<[string] | null>(['default', 'ux1', 'po1']);
  const router = useRouter();
  const appName = 'teaching'
    useEffect(() => {
        setTimeout(() => {
            const childData = singleMicroApp?.getData(appName)
            console.log(childData);
        }, 3000)
    }, [singleMicroApp])
  useEffect(() => {
    const initMicroApp = async () => {
      console.log("initialize micro web")
      const { default: microApp } = await import('@micro-zoe/micro-app');
      console.log("micro app", microApp);
      singleMicroApp = microApp;
          microApp.start({
              lifeCycles: {
                  created() {
                      console.log("micro app start");
                  },
                  error(e) {
                      console.log("micro app error");
                  },
                  mounted(e?: CustomEvent) {
                      console.log(e)
                  },
              },
          });
          setTimeout(() => {
              singleMicroApp.setData(appName, {product: product});
          }, 1500);
      };
      if (!singleMicroApp) {
          initMicroApp();
      }
    const checkPermission = async () => {
      try {
        // Here we simulate a permission check with the backend.
        // In a real scenario, you'd call an API endpoint like /api/check-docs-permission
        // or use the existing requestInstance to check against a backend service.

        // For now, we'll check if a userToken exists as a basic form of authorization
        // and simulate a backend delay.
        const token = localStorage.getItem('userToken');

        if (!token) {
          setAuthorized(false);
          return;
        }

        // Simulating backend permission check
        // const response = await requestInstance.get('/check-docs-permission');
        // if (response.code === 0 || response.code === 20000) setAuthorized(true);
        // else setAuthorized(false);

        // Mocking successful authorization for demo purposes if token exists
        setTimeout(() => {
          setAuthorized(true);
        }, 500);

      } catch (error) {
        console.error('Permission check failed:', error);
        setAuthorized(false);
      }
    };

    // checkPermission();
  }, []);

  if (authorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <span className="ml-4">Checking permissions...</span>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-2 text-gray-600">You do not have permission to view the documentation.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Go Back Home
        </button>
      </div>
    );
  }


    return (
    <div className="flex h-screen w-full">
        <div>
            <micro-app
                name={appName}
                url={`http://localhost:4173`}
                router-mode="search"
                onCreated={() => console.log('micro-app元素被创建')}
                onBeforemount={() => console.log('即将渲染')}
                onMounted={() => console.log('已经渲染完成')}
                onUnmount={() => console.log('已经卸载')}
                onError={() => console.log('加载出错')}
                keep-alive
            >
            </micro-app>
        </div>
      {/*<iframe*/}
      {/*  src="http://localhost:3000"*/}
      {/*  className="h-full w-full border-none"*/}
      {/*  title="Documentation"*/}
      {/*/>*/}
    </div>
  );
}
