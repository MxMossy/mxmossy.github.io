<script>
	import { blur, fly } from 'svelte/transition';
	let projects = ['Sketris', 'Snowbound', 'Handy Robotics'];
</script>

<div
	class="absolute flex h-full w-full items-center justify-center gap-10 md:flex-row md:items-start"
	in:fly={{ x: -500, duration: 500 }}
	out:fly={{ x: 500, duration: 500 }}
>
	<div class="flex h-full w-full flex-col items-center justify-start gap-10">
		<h1 class="text-4xl font-bold">Coming Soon</h1>
		<h1 class="text-2xl">
			Old page <a class="text-blue-500 hover:underline" href="https://mxmoss.me/portfolio">here</a>
		</h1>
	</div>
	<!-- {#each projects as project}
		<div
			class="flex h-64 w-48 items-center justify-center gap-10 rounded-md border-2 border-slate-200"
		>
			<h2 class="text-2xl">{project}</h2>
		</div>
	{/each} -->
</div>
