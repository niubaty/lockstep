import asyncio
import websockets
import random
import json

remote_ip = '127.0.0.1'
# 向服务器端认证，用户名密码通过才能退出循环
async def auth_system(websocket):
    while True:
        cred_text = input("please enter your username and password: ")
        await websocket.send(cred_text)
        response_str = await websocket.recv()
        if "congratulation" in response_str:
            return True

# 向服务器端发送认证后的消息
async def send_msg(websocket):
    while True:
        await asyncio.sleep(3)
        _text = input("please enter your context: ")
        if _text == "exit":
            print(f'you have enter "exit", goodbye')
            await websocket.close(reason="user exit")
            return False
        await websocket.send(_text)
        #recv_text = await websocket.recv()
        #print(f"{recv_text}")

async def auto_send_msg(websocket):
    for i in range(1000):
        await asyncio.sleep(random.random()*3)
        _text = json.dumps({'hp':random.random()*10,'atk':random.random()*50})#input("please enter your context: ")
        await websocket.send(_text)
    print(f'you have enter "exit", goodbye')
    await websocket.close(reason="user exit")
    return False

async def recv_update(ws):
    while True:
        recv_text = await ws.recv()
        print(f"{recv_text}")
        # print('test')

async def run(ws):
    await asyncio.gather(
        #send_msg(ws),
        auto_send_msg(ws),
        recv_update(ws)
    )


# 客户端主逻辑
async def main_logic():
    async with websockets.connect('ws://%s:5678'%remote_ip) as websocket:
        await auth_system(websocket)
        await run(websocket)


asyncio.get_event_loop().run_until_complete(main_logic())