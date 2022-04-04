<script setup>
	import {
		ref,
		computed,
		reactive,
		onMounted,
		getCurrentInstance
	} from "vue";
	import {
		startFind
	} from "../../utilities/spider.js"

	const shell = window.shell;



	const proxy = ref("");
	const Forumsdomain = ref("");
	const areaUrl = ref("");
	const findExtent = ref("");
	const findKey = ref("");
	const progress = ref(0);
	const delayTime = ref(0);
	const tableData = reactive({
		list: []
	})
	const https = ref(true);

	const startLookUp = async () => {
		tableData.list = [];
		const extent = JSON.parse(findExtent.value);
		const protocol = https.value === true ? 'https' : "http";
		const url = `${protocol}://${Forumsdomain.value}${areaUrl.value}`;
		const proxyR = proxy.value.split(":");
		const proxyObj = proxy.value.length === 0 ? null : {
			host: proxyR[0],
			port: parseInt(proxyR[1])
		}
		let numbers = 0;
		let r = await startFind(url, extent, findKey.value, proxyObj, delayTime.value, (total, current, data) => {
			progress.value = ((current / total) * 100).toFixed(2);
			let list = [];
			data.forEach((item, key) => {
				list.push({
					number: ++numbers,
					href: `${protocol}://${Forumsdomain.value}${item.href[0]==='/'?'':'/'}${item.href}`,
					text: `${item.subtitle}`
				})
			});
			tableData.list = [...tableData.list, ...list];
		});
		//console.log(r);

		console.log(list);
		tableData.list = list;
	}
	const isDisable = computed(() => {
		return Forumsdomain.value === "" || areaUrl.value === "";
	})

	const openUrl = (url) => {
		shell.openExternal(url);
	}
	const save = () => {
		let r = [];
		tableData.list.forEach((item) => {
			r.push(`<p><a href='${item.href}' target="_blank">${item.text}</a></p>`);
		});
		let html = `<html>
		   <body>
		       ${r.join('\n')}
		   </body>
		</html>`
		console.log(html);
		window.ipcRenderer.send("writeFile", {
			data: html,
			key: findKey.value
		});
	}
	onMounted(() => {
		let this_ = getCurrentInstance().proxy;
		window.ipcRenderer.on("writeComplete", (event, msg) => {
			console.log(msg);
			if (msg.status === "success") {
				this_.$alert('保存成功', {
					confirmButtonText: '确定',
					callback: action => {}
				});
			} else {
				this_.$alert(`${msg.msg}`, {
					confirmButtonText: '确定',
					callback: action => {}
				});
			}
		})
	})
</script>

<template>
	<div class="main-body">
		<div class="input-group">
			<div class="input-item">
				<div class="title">
					<span>代理服务器:</span>
				</div>
				<div class="input-container">
					<el-input v-model="proxy" placeholder="请输入内容"></el-input>
				</div>
			</div>
			<div class="input-item">
				<div class="title">
					<span>论坛域名:</span>
				</div>
				<div class="input-container">
					<el-input v-model="Forumsdomain" placeholder="请输入内容"></el-input>
				</div>
				<div class="enable-https">
					<el-checkbox v-model="https" :true-label="true" :false-label="false">https</el-checkbox>
				</div>
			</div>
			<div class="input-item">
				<div class="title">
					<span>版块路径:</span>
				</div>
				<div class="input-container">
					<el-input v-model="areaUrl" placeholder="/xx/yy[format:{page}]"></el-input>
				</div>
			</div>
			<div class="input-item">
				<div class="title">
					<span>关键词:</span>
				</div>
				<div class="input-container">
					<el-input v-model="findKey" placeholder="请输入内容"></el-input>
				</div>
			</div>
			<div class="input-item">
				<div class="title">
					<span>扫描范围:</span>
				</div>
				<div class="input-container">
					<el-input v-model="findExtent" placeholder="[from,to]"></el-input>
				</div>
			</div>
			<div class="input-item">
				<div class="title">
					<span>延迟时间:</span>
				</div>
				<div class="input-container">
					<el-input v-model="delayTime" placeholder="单位ms"></el-input>
				</div>
			</div>
			<div class="input-item">
				<el-button type="primary" @click="startLookUp" :disabled="isDisable">开始查找</el-button>
				<el-button type="primary" @click="save" :disabled="tableData.list.length===0">保存结果</el-button>
			</div>
			<div class="progress-container">
				<el-progress :percentage="progress"></el-progress>
			</div>
		</div>
		<div class="table-container">
			<el-table :data="tableData.list" style="width: 100%">
				<el-table-column prop="number" label="序号" width="100">
				</el-table-column>
				<el-table-column label="词条">
					<template v-slot="data">
						<div class="enable-tap" @click="openUrl(data.row.href)">{{data.row.text}}</div>
					</template>
				</el-table-column>
			</el-table>
		</div>
	</div>
</template>

<style scoped>
	.main-body {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.input-group {
		width: 500px;
	}

	.input-item {
		display: flex;
		align-items: center;
		justify-content: space-around;
		margin-bottom: 15px;
	}

	.title {
		width: 100px;
	}

	.input-container {
		margin-left: 10px;
		flex: 1;
	}

	.table-container {
		width: 500px;
	}

	.enable-tap {
		cursor: pointer;
	}

	.enable-https {
		margin-left: 10px;
	}

	.progress-container {
		margin-top: 10px;
		margin-bottom: 10px;
	}
</style>
