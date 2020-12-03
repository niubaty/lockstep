import asyncio
import websockets
import json

local_ip = '127.0.0.1'
#

#{
#  username:state_obj}
# }
#
#
g_state = {}
#{
#  ws:'username'
# 
# }
g_conn = {}
g_count = 0


# 检测客户端权限，用户名密码通过才能退出循环
async def check_permit(websocket):
    print(websocket)
    print(type(websocket))
    print(dir(websocket))
    while True:
        recv_str = await websocket.recv()
        cred_dict = recv_str.split(":")
        if cred_dict[1] == "123456":
            response_str = "congratulation, you have connect with server\r\nnow, you can do something else"
            await websocket.send(response_str)
            user_name = cred_dict[0]
            g_conn.update({websocket:user_name})
            g_state.update({user_name:{}})
            return True
        else:
            response_str = "sorry, the username or password is wrong, please submit again"
            await websocket.send(response_str)
            # return False
            

# 接收客户端消息并处理，这里只是简单把客户端发来的返回回去
async def recv_msg(websocket):
    global g_state,g_conn
    while True:
        recv_text = await websocket.recv()
        #手工测试时 再打开
        #response_text = f"your submit context: {recv_text}"
        #await websocket.send(response_text)
        # 更新 状态
        try:
            obj = json.loads(recv_text)
            user_name = g_conn[websocket]
            g_state[user_name].update(obj)
            print('o',obj)
        except:
            print('json err '+recv_text)







# 服务器端主逻辑
# websocket和path是该函数被回调时自动传过来的，不需要自己传
async def main_logic(websocket, path):
    print('recv connect')
    # print(websocket.remote_address)
    await check_permit(websocket)
    await recv_msg(websocket)

# 把ip换成自己本地的ip
start_server = websockets.serve(main_logic, local_ip , 5678)
# 如果要给被回调的main_logic传递自定义参数，可使用以下形式
# 一、修改回调形式
# import functools
# start_server = websockets.serve(functools.partial(main_logic, other_param="test_value"), '10.10.6.91', 5678)
# 修改被回调函数定义，增加相应参数
# async def main_logic(websocket, path, other_param)
# async def tick_send_all():
    

async def tick_send_all():
    global g_state,g_count,g_conn
    while True:
        await asyncio.sleep(0.1)
        # tick_send_all
        for ws in g_conn:
            if ws.closed:
                print('closeeeeeeeeeeeeeeeeeeee')
                del g_conn[ws]
                break
            else:
                send_str = json.dumps({str(g_count):g_state})
                await ws.send(send_str)

        g_count+=1
        print('send',g_count)

async def main():
    await asyncio.gather(
        start_server,
        tick_send_all(),
    )


asyncio.get_event_loop().run_until_complete(main())
asyncio.get_event_loop().run_forever()