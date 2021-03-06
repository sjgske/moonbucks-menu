import { $ } from "./utils/dom.js";
import MenuApi from "./api/index.js";

function App() {
	this.menu = {
		espresso: [],
		frappuccino: [],
		blended: [],
		teavana: [],
		desert: [],
	};
	this.currentCategory = "espresso";

	// 새로고침 시 실행되는 함수
	this.init = async () => {
		render();
		initEventListeners();
	};

	// 전체 메뉴 데이터 불러오기 + 화면에 보여주기
	const render = async () => {
		this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(this.currentCategory);
		const template = this.menu[this.currentCategory]
			.map(menuItem => {
				return `
        <li data-menu-id="${menuItem.id}" class="menu-list-item d-flex items-center py-2">
        <span class="w-100 pl-2 menu-name ${menuItem.isSoldOut ? "sold-out" : ""} ">${
					menuItem.name
				}</span>
        <button
          type="button"
          class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"
        >
          품절
        </button>
        <button
          type="button"
          class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
        >
          수정
        </button>
        <button
          type="button"
          class="bg-gray-50 text-gray-500 text-sm menu-remove-button"
        >
          삭제
        </button>
        </li>`;
			})
			.join("");

		$("#menu-list").innerHTML = template;
		updateMenuCount();
	};

	// 메뉴 개수 세기
	const updateMenuCount = () => {
		const menuCount = this.menu[this.currentCategory].length;
		$(".menu-count").innerText = `총 ${menuCount}개`;
	};

	// 메뉴 추가
	const addMenuName = async () => {
		const menuName = $("#menu-name").value;
		if (menuName === "") {
			alert("메뉴명을 입력해주세요.");
			return;
		}
		const duplicatedItem = this.menu[this.currentCategory].find(
			menuItem => menuName === menuItem.name,
		);
		if (duplicatedItem) {
			alert("이미 등록된 메뉴입니다.");
			$("#menu-name").value = "";
			return;
		}

		await MenuApi.createMenu(this.currentCategory, menuName);
		render();
		$("#menu-name").value = "";
	};

	// 메뉴 수정
	const updateMenuName = async e => {
		const menuId = e.target.closest("li").dataset.menuId;
		const $menuName = e.target.closest("li").querySelector(".menu-name");
		const newMenuName = prompt("메뉴명을 수정하세요.", $menuName.innerText);

		if (newMenuName === "") {
			alert("메뉴명을 입력해주세요!");
			return;
		} else if (newMenuName !== null) {
			await MenuApi.updateMenu(this.currentCategory, newMenuName, menuId);
			render();
		}
	};

	// 메뉴 삭제
	const removeMenuName = async e => {
		if (confirm("정말 삭제하시겠습니까?")) {
			const menuId = e.target.closest("li").dataset.menuId;
			await MenuApi.deleteMenu(this.currentCategory, menuId);
			render();
		}
	};

	// 메뉴 품절 toggle
	const soldOutMenu = async e => {
		const menuId = e.target.closest("li").dataset.menuId;
		await MenuApi.toggleSoldOutMenu(this.currentCategory, menuId);
		render();
	};

	// 카테고리 버튼 클릭 시 카테고리 변경
	const changeCategory = e => {
		const isCategoryButton = e.target.classList.contains("cafe-category-name");
		if (isCategoryButton) {
			const categoryName = e.target.dataset.categoryName;
			this.currentCategory = categoryName;
			$("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;
			render();
			$("#menu-name").value = "";
		}
	};

	const initEventListeners = () => {
		// 메뉴 리스트 수정, 삭제, 품절 버튼 이벤트리스너
		$("#menu-list").addEventListener("click", e => {
			if (e.target.classList.contains("menu-edit-button")) {
				updateMenuName(e);
				return;
			}
			if (e.target.classList.contains("menu-remove-button")) {
				removeMenuName(e);
				return;
			}
			if (e.target.classList.contains("menu-sold-out-button")) {
				soldOutMenu(e);
				return;
			}
		});

		// form 전송 시 새로고침 방지, 메뉴 추가
		$("#menu-form").addEventListener("submit", e => {
			e.preventDefault();
			addMenuName();
		});

		$("nav").addEventListener("click", changeCategory);
	};
}

const app = new App();
app.init();
